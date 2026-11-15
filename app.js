let authSenha = sessionStorage.getItem('painel_senha') || '';
let userRole = sessionStorage.getItem('painel_role') || '';
let servidoresCache = [];

document.addEventListener('DOMContentLoaded', () => {
  configurarPreviewAoVivo();
  if (authSenha) {
    inicializarPainelAutenticado();
  }
});

async function apiFetch(url, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    'x-auth-pass': authSenha
  };
  return fetch(url, options);
}

// Login
document.getElementById('btn-login').addEventListener('click', fazerLogin);
document.getElementById('login-senha').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') fazerLogin();
});

async function fazerLogin() {
  const senhaInput = document.getElementById('login-senha').value.trim();
  const erroSpan = document.getElementById('login-erro');

  if (!senhaInput) {
    erroSpan.textContent = 'Digite sua senha.';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: senhaInput })
    });
    const data = await res.json();

    if (data.sucesso) {
      authSenha = senhaInput;
      userRole = data.role;
      sessionStorage.setItem('painel_senha', authSenha);
      sessionStorage.setItem('painel_role', userRole);
      erroSpan.textContent = '';
      inicializarPainelAutenticado();
    } else {
      erroSpan.textContent = data.mensagem || 'Senha incorreta.';
    }
  } catch (err) {
    erroSpan.textContent = 'Erro de conexão com o servidor.';
  }
}

// Sair
document.getElementById('btn-sair').addEventListener('click', () => {
  sessionStorage.removeItem('painel_senha');
  sessionStorage.removeItem('painel_role');
  authSenha = '';
  userRole = '';
  document.getElementById('login-senha').value = '';
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
});

async function inicializarPainelAutenticado() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';

  const roleBadge = document.getElementById('role-badge');
  const roleSubtitle = document.getElementById('role-subtitle');
  const criadorSection = document.getElementById('criador-only-section');

  if (userRole === 'criador') {
    roleBadge.textContent = 'CRIADOR';
    roleBadge.className = 'role-tag criador';
    roleSubtitle.textContent = 'Você gerencia o Token do Bot, senhas e postagens';
    criadorSection.style.display = 'block';
  } else {
    roleBadge.textContent = 'SUB-CRIADOR';
    roleBadge.className = 'role-tag subcriador';
    roleSubtitle.textContent = 'Acesso liberado para criar e publicar postagens';
    criadorSection.style.display = 'none';
  }

  await verificarStatusBot();
}

async function verificarStatusBot() {
  const statusSpan = document.getElementById('token-status');
  const subAlert = document.getElementById('sub-offline-alert');

  try {
    const response = await apiFetch('/api/status');
    if (response.status === 401) {
      document.getElementById('btn-sair').click();
      return;
    }

    const data = await response.json();

    if (data.online) {
      atualizarEstadoConectado(data.tag, data.avatar);
      subAlert.style.display = 'none';
      if (userRole === 'criador') {
        statusSpan.style.color = '#23a55a';
        statusSpan.textContent = `Bot ativo (${data.tag}). Sub-Criadores já têm acesso!`;
      }
      carregarServidores();
    } else {
      if (userRole === 'criador') {
        statusSpan.style.color = '#faa61a';
        statusSpan.textContent = data.error || 'Bot offline. Cole o Token acima para ativar.';
      } else {
        subAlert.style.display = 'block';
      }
    }
  } catch (e) {
    console.error(e);
  }
}

function atualizarEstadoConectado(tag, avatar) {
  const badge = document.getElementById('bot-badge');
  const badgeText = document.getElementById('bot-badge-text');
  const painel = document.getElementById('painel-principal');

  badge.classList.remove('offline');
  badge.classList.add('online');
  badgeText.textContent = tag;
  painel.classList.remove('disabled-panel');

  document.getElementById('preview-bot-name').textContent = tag.split('#')[0];
  if (avatar) {
    document.getElementById('preview-bot-avatar').src = avatar;
  }
}

// Ativar Token (Criador)
document.getElementById('salvar-token-btn').addEventListener('click', async () => {
  const token = document.getElementById('bot-token-input').value.trim();
  const statusSpan = document.getElementById('token-status');

  if (!token) {
    statusSpan.style.color = '#f23f43';
    statusSpan.textContent = 'Por favor, cole um token válido.';
    return;
  }

  statusSpan.style.color = '#faa61a';
  statusSpan.textContent = 'Ativando bot no Discord, aguarde...';

  try {
    const response = await apiFetch('/api/configurar-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });

    const res = await response.json();
    if (res.sucesso) {
      statusSpan.style.color = '#23a55a';
      statusSpan.textContent = res.mensagem;
      document.getElementById('bot-token-input').value = '';
      atualizarEstadoConectado(res.tag, res.avatar);
      carregarServidores();
    } else {
      statusSpan.style.color = '#f23f43';
      statusSpan.textContent = 'Erro: ' + res.mensagem;
    }
  } catch (err) {
    statusSpan.style.color = '#f23f43';
    statusSpan.textContent = 'Erro de comunicação.';
  }
});

// Alterar Senhas (Criador)
document.getElementById('salvar-senhas-btn').addEventListener('click', async () => {
  const novaSenhaCriador = document.getElementById('nova-senha-criador').value.trim();
  const novaSenhaSub = document.getElementById('nova-senha-sub').value.trim();
  const statusSpan = document.getElementById('senhas-status');

  if (!novaSenhaCriador && !novaSenhaSub) {
    statusSpan.style.color = '#faa61a';
    statusSpan.textContent = 'Preencha pelo menos uma nova senha.';
    return;
  }

  try {
    const response = await apiFetch('/api/alterar-senhas', {
      method: 'POST',
      body: JSON.stringify({ novaSenhaCriador, novaSenhaSub })
    });
    const res = await response.json();

    if (res.sucesso) {
      statusSpan.style.color = '#23a55a';
      statusSpan.textContent = res.mensagem;
      if (novaSenhaCriador) {
        authSenha = novaSenhaCriador;
        sessionStorage.setItem('painel_senha', authSenha);
      }
      document.getElementById('nova-senha-criador').value = '';
      document.getElementById('nova-senha-sub').value = '';
    } else {
      statusSpan.style.color = '#f23f43';
      statusSpan.textContent = res.mensagem;
    }
  } catch (e) {
    statusSpan.style.color = '#f23f43';
    statusSpan.textContent = 'Erro ao salvar senhas.';
  }
});

async function carregarServidores() {
  const selectServidor = document.getElementById('select-servidor');

  try {
    const response = await apiFetch('/api/servidores');
    const data = await response.json();

    if (!data.sucesso) return;

    servidoresCache = data.servidores;
    selectServidor.innerHTML = '';

    if (servidoresCache.length === 0) {
      selectServidor.innerHTML = '<option value="">O bot não está em nenhum servidor!</option>';
      return;
    }

    servidoresCache.forEach(srv => {
      const opt = document.createElement('option');
      opt.value = srv.id;
      opt.textContent = srv.nome;
      selectServidor.appendChild(opt);
    });

    atualizarCanaisDoServidor(servidoresCache[0].id);
  } catch (e) {
    console.error('Erro ao carregar servidores:', e);
  }
}

document.getElementById('select-servidor').addEventListener('change', (e) => {
  atualizarCanaisDoServidor(e.target.value);
});

function atualizarCanaisDoServidor(servidorId) {
  const selectCanal = document.getElementById('select-canal');
  const servidor = servidoresCache.find(s => s.id === servidorId);
  selectCanal.innerHTML = '';

  if (!servidor || servidor.canais.length === 0) {
    selectCanal.innerHTML = '<option value="">Nenhum canal disponível</option>';
    return;
  }

  servidor.canais.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch.id;
    opt.textContent = `# ${ch.nome}`;
    selectCanal.appendChild(opt);
  });
}

document.getElementById('add-field-btn').addEventListener('click', () => {
  const container = document.getElementById('fields-container');
  const div = document.createElement('div');
  div.className = 'field-item';
  div.innerHTML = `
    <div class="field-item-top">
      <input type="text" class="field-name" placeholder="Nome do campo">
      <button type="button" class="btn-danger remove-field-btn">X</button>
    </div>
    <textarea class="field-value" rows="2" placeholder="Valor/Texto do campo"></textarea>
    <div class="field-item-bottom">
      <label class="checkbox-inline">
        <input type="checkbox" class="field-inline">
        <span>Exibir lado a lado (Inline)</span>
      </label>
    </div>
  `;

  div.querySelector('.remove-field-btn').addEventListener('click', () => {
    div.remove();
    atualizarPreview();
  });

  div.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', atualizarPreview);
    el.addEventListener('change', atualizarPreview);
  });

  container.appendChild(div);
  atualizarPreview();
});

document.getElementById('usar-embed').addEventListener('change', (e) => {
  const editor = document.getElementById('embed-editor-fields');
  const previewEmbed = document.getElementById('preview-embed');
  editor.style.display = e.target.checked ? 'block' : 'none';
  previewEmbed.style.display = e.target.checked ? 'block' : 'none';
});

function configurarPreviewAoVivo() {
  const inputs = [
    'conteudo-texto', 'embed-titulo', 'embed-descricao', 'embed-cor',
    'embed-autor-nome', 'embed-autor-icone', 'embed-thumbnail',
    'embed-imagem', 'embed-footer-texto', 'embed-footer-icone', 'embed-timestamp'
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', atualizarPreview);
      el.addEventListener('change', atualizarPreview);
    }
  });
}

function atualizarPreview() {
  const conteudo = document.getElementById('conteudo-texto').value;
  const titulo = document.getElementById('embed-titulo').value;
  const descricao = document.getElementById('embed-descricao').value;
  const cor = document.getElementById('embed-cor').value;
  const autorNome = document.getElementById('embed-autor-nome').value;
  const autorIcone = document.getElementById('embed-autor-icone').value;
  const thumbnail = document.getElementById('embed-thumbnail').value;
  const imagem = document.getElementById('embed-imagem').value;
  const footerTexto = document.getElementById('embed-footer-texto').value;
  const footerIcone = document.getElementById('embed-footer-icone').value;
  const timestamp = document.getElementById('embed-timestamp').checked;

  document.getElementById('preview-content').textContent = conteudo;
  document.getElementById('preview-embed').style.borderLeftColor = cor;

  const prevTitle = document.getElementById('preview-title');
  prevTitle.textContent = titulo || (!descricao && !autorNome ? 'Título do Embed' : '');
  prevTitle.style.display = prevTitle.textContent ? 'block' : 'none';

  const prevDesc = document.getElementById('preview-description');
  prevDesc.textContent = descricao || (!titulo && !autorNome ? 'Sua descrição aparecerá aqui em tempo real...' : '');
  prevDesc.style.display = prevDesc.textContent ? 'block' : 'none';

  const prevAuthor = document.getElementById('preview-author');
  const prevAuthorIcon = document.getElementById('preview-author-icon');
  if (autorNome) {
    prevAuthor.style.display = 'flex';
    document.getElementById('preview-author-name').textContent = autorNome;
    if (autorIcone) {
      prevAuthorIcon.src = autorIcone;
      prevAuthorIcon.style.display = 'block';
    } else {
      prevAuthorIcon.style.display = 'none';
    }
  } else {
    prevAuthor.style.display = 'none';
  }

  const prevThumb = document.getElementById('preview-thumbnail');
  if (thumbnail) {
    prevThumb.src = thumbnail;
    prevThumb.style.display = 'block';
  } else {
    prevThumb.style.display = 'none';
  }

  const prevImg = document.getElementById('preview-image');
  if (imagem) {
    prevImg.src = imagem;
    prevImg.style.display = 'block';
  } else {
    prevImg.style.display = 'none';
  }

  const prevFields = document.getElementById('preview-fields');
  prevFields.innerHTML = '';
  document.querySelectorAll('.field-item').forEach(item => {
    const name = item.querySelector('.field-name').value;
    const val = item.querySelector('.field-value').value;
    const inline = item.querySelector('.field-inline').checked;
    if (name || val) {
      const box = document.createElement('div');
      box.className = 'embed-field-box' + (inline ? ' inline' : '');
      box.innerHTML = `
        <div class="embed-field-name">${name || 'Campo'}</div>
        <div class="embed-field-value">${val || '...'}</div>
      `;
      prevFields.appendChild(box);
    }
  });

  const prevFooter = document.getElementById('preview-footer');
  const prevFooterIcon = document.getElementById('preview-footer-icon');
  const prevFooterText = document.getElementById('preview-footer-text');
  let textoRodapeFinal = footerTexto;
  if (timestamp) {
    textoRodapeFinal += (textoRodapeFinal ? ' • ' : '') + 'Hoje às 12:00';
  }

  if (textoRodapeFinal) {
    prevFooter.style.display = 'flex';
    prevFooterText.textContent = textoRodapeFinal;
    if (footerIcone) {
      prevFooterIcon.src = footerIcone;
      prevFooterIcon.style.display = 'block';
    } else {
      prevFooterIcon.style.display = 'none';
    }
  } else {
    prevFooter.style.display = 'none';
  }
}

document.getElementById('enviar-post-btn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('envio-status');
  const canalId = document.getElementById('select-canal').value;

  if (!canalId) {
    statusDiv.style.color = '#f23f43';
    statusDiv.textContent = 'Selecione um canal válido antes de postar.';
    return;
  }

  const embedFields = [];
  document.querySelectorAll('.field-item').forEach(item => {
    embedFields.push({
      name: item.querySelector('.field-name').value,
      value: item.querySelector('.field-value').value,
      inline: item.querySelector('.field-inline').checked
    });
  });

  const payload = {
    canalId,
    conteudoTexto: document.getElementById('conteudo-texto').value,
    usarEmbed: document.getElementById('usar-embed').checked,
    embedTitulo: document.getElementById('embed-titulo').value,
    embedDescricao: document.getElementById('embed-descricao').value,
    embedCor: document.getElementById('embed-cor').value,
    embedAutorNome: document.getElementById('embed-autor-nome').value,
    embedAutorIcone: document.getElementById('embed-autor-icone').value,
    embedThumbnail: document.getElementById('embed-thumbnail').value,
    embedImagem: document.getElementById('embed-imagem').value,
    embedFooterTexto: document.getElementById('embed-footer-texto').value,
    embedFooterIcone: document.getElementById('embed-footer-icone').value,
    embedTimestamp: document.getElementById('embed-timestamp').checked,
    embedFields
  };

  statusDiv.style.color = '#faa61a';
  statusDiv.textContent = 'Enviando postagem para o Discord...';

  try {
    const response = await apiFetch('/api/enviar-mensagem', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const res = await response.json();
    if (res.sucesso) {
      statusDiv.style.color = '#23a55a';
      statusDiv.textContent = '✅ ' + res.mensagem;
    } else {
      statusDiv.style.color = '#f23f43';
      statusDiv.textContent = '❌ ' + res.mensagem;
    }
  } catch (err) {
    statusDiv.style.color = '#f23f43';
    statusDiv.textContent = 'Erro de conexão ao enviar.';
  }
});
