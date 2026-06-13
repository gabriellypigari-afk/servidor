// ==========================================
// 1. DEPENDÊNCIAS, CONFIGURAÇÕES E SERVIDOR
// ==========================================
require('dotenv').config(); 
const express = require('express');
const app = express();
const token = process.env.DISCORD_BOT_TOKEN || process.env.BOT_TOKEN;

if (!token) {
    console.error('ERRO: Token do bot não encontrado. Informe DISCORD_BOT_TOKEN no .env ou pelo iniciar_bot.bat.');
    process.exit(1);
}

app.get('/', (req, res) => {
    res.send('🏥 Hospital RP Bot está online e funcionando!');
});

app.listen(3000, () => {
    console.log('🌐 Servidor Web de Uptime iniciado na porta 3000.');
});

const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    StringSelectMenuBuilder, 
    RoleSelectMenuBuilder, 
    REST, 
    Routes, 
    PermissionFlagsBits
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ==========================================
// 2. CONFIGURAÇÕES DOS CARGOS E CANAIS (IDs)
// ==========================================
// 🖼️ CONFIGURAÇÕES DO SERVIDOR (configurável via /config)
let configServidor = {
    logo: null,
    cor: '#ff0000',
    nome: 'Hospital - Paulista'
};
const CARGOS = {
    PACIENTE: "1510312501886320690",
    ESTAGIARIO: "1510312481665585232",
    ENFERMEIRO: "1510312480306368817",
    PARAMEDICO: "1510312479467507845",
    MEDICO: "1510312478557601822",
    MEDICO_CHEFE_M: "1510312476888273056",
    MEDICA_CHEFE_F: "1510312477542322267",
    PEDIATRA: "1510312496055976067",
    OBSTETRA: "1510312497104552046",
    PSICOLOGO: "1510312495011725364",
    CIRURGIAO: "1510312498103058452",
    CHEFE_PEDIATRIA: "1510312487243878420",
    CHEFE_OBSTETRICIA: "1510312488439124091",
    CHEFE_PSICOLOGIA: "1510312489726902414", 
    CHEFE_CIRURGIA: "1510312490918084781",
    SUPERVISOR: "1510312473365053551",
    COORDENADOR: "1510312472354230303",
    VICE_DIRETOR: "1510312470894481651",
    DIRETOR: "1510312470361931806",
    DIRETOR_GERAL: "1510312468826816675",

    // 🧠 NOVOS CARGOS DA HIERARQUIA DE PSICOLOGIA
    AUXILIAR_PSICOLOGIA: "1514341412450205716",
    SUPERVISOR_PSICOLOGIA: "1514341657448026233",
    COORDENADOR_PSICOLOGIA: "1514341841439555674",

    // 🚑 CHEFE DO SAMU (chefia dos paramédicos)
    CHEFE_SAMU: "1514465218518843412",

    // ⚖️ SISTEMA DE REGISTRO
    JURIDICO: "1510312483666264154",
    POLICIA: "1510312484446408735"
};

const ID_DIRETOR_GERAL = CARGOS.DIRETOR_GERAL; 

const CANAIS = {
    LOGS_PONTO: "1510312565492809820",
    LOGS_RH: "1510361017958535169",
    HIERARQUIA: "1510312567279714416", 
    DIRETORIA_FICHAS: "1510361196799332482", 
    
    // 🧠 CANAL EXCLUSIVO DA HIERARQUIA DA PSICOLOGIA
    HIERARQUIA_PSICOLOGIA: "1514444299293429780"
};

const ORDEM_CARGOS = [
    CARGOS.PACIENTE,
    CARGOS.ESTAGIARIO,
    CARGOS.ENFERMEIRO,
    CARGOS.PARAMEDICO,
    CARGOS.MEDICO,
    CARGOS.MEDICO_CHEFE_M,
    CARGOS.MEDICA_CHEFE_F,
    CARGOS.PEDIATRA,
    CARGOS.OBSTETRA,
    CARGOS.AUXILIAR_PSICOLOGIA,
    CARGOS.PSICOLOGO,
    CARGOS.SUPERVISOR_PSICOLOGIA,
    CARGOS.COORDENADOR_PSICOLOGIA,
    CARGOS.CHEFE_PSICOLOGIA,
    CARGOS.CHEFE_SAMU,
    CARGOS.CIRURGIAO,
    CARGOS.CHEFE_PEDIATRIA,
    CARGOS.CHEFE_OBSTETRICIA,
    CARGOS.CHEFE_CIRURGIA,
    CARGOS.SUPERVISOR,
    CARGOS.COORDENADOR,
    CARGOS.VICE_DIRETOR,
    CARGOS.DIRETOR,
    CARGOS.DIRETOR_GERAL
];

const PREFIXOS = {
    [CARGOS.PACIENTE]: "{Pac}",
    [CARGOS.ESTAGIARIO]: "{Est}",
    [CARGOS.ENFERMEIRO]: "{Enf}",
    [CARGOS.PARAMEDICO]: "{Par}",
    [CARGOS.MEDICO]: "{Med}",
    [CARGOS.MEDICO_CHEFE_M]: "{MedCh}",
    [CARGOS.MEDICA_CHEFE_F]: "{MedCh}",
    [CARGOS.PEDIATRA]: "{Ped}",
    [CARGOS.OBSTETRA]: "{Obs}",
    [CARGOS.AUXILIAR_PSICOLOGIA]: "{AuxPsi}",
    [CARGOS.PSICOLOGO]: "{Psi}",
    [CARGOS.SUPERVISOR_PSICOLOGIA]: "{SupPsi}",
    [CARGOS.COORDENADOR_PSICOLOGIA]: "{CooPsi}",
    [CARGOS.CHEFE_PSICOLOGIA]: "{ChPsi}",
    [CARGOS.CHEFE_SAMU]: "{ChSamu}",
    [CARGOS.JURIDICO]: "{Jur}",
    [CARGOS.POLICIA]: "{Policia}",
    [CARGOS.CIRURGIAO]: "{Cir}",
    [CARGOS.CHEFE_PEDIATRIA]: "{ChPed}",
    [CARGOS.CHEFE_OBSTETRICIA]: "{ChObs}",
    [CARGOS.CHEFE_CIRURGIA]: "{ChCir}",
    [CARGOS.SUPERVISOR]: "{Sup}",
    [CARGOS.COORDENADOR]: "{Coo}",
    [CARGOS.VICE_DIRETOR]: "{VDir}",
    [CARGOS.DIRETOR]: "{Dir}",
    [CARGOS.DIRETOR_GERAL]: "{DirG}"
};

// ==========================================
// 3. BANCO DE DADOS EM MEMÓRIA
// ==========================================
let permissoesRH = {
    promover: null, rebaixar: null, advertir: null, exonerar: null, fichas: null
};

// pontosAtivos: userId -> { entrada: timestamp, pausas: [{inicio, fim}], pausaAtual: timestamp|null, totalPausado: ms }
const pontosAtivos = new Map();
const fichasPendentes = new Map(); 
const advertenciasBanco = new Map(); 

// 📊 HISTÓRICO DE PONTO DETALHADO
// historicoPonto: userId -> [{ entrada, saida, duracao (min), pausas (min), data }]
const historicoPonto = new Map();



// 📊 RANKING DE PONTO
const rankingPonto = new Map(); // userId -> { minutos: number, nome: string }
let pontoResetConfig = {
    modo: null, // 'semanal' ou 'mensal' ou null (manual)
    ultimoReset: Date.now()
};

// ==========================================
// 4. REGISTRO DE COMANDOS SLASH (/)
// ==========================================
const comandos = [
    { 
        name: 'setar_apelido', 
        description: '📝 Altera o apelido do membro no padrão: {TAG} Nome | ID', 
        options: [
            { name: 'membro', type: 6, description: 'Membro que terá o apelido alterado', required: true },
            { name: 'tag', type: 3, description: 'Ex: Med, Vice, Enf, Est', required: true },
            { name: 'nome', type: 3, description: 'Nome do jogador', required: true },
            { name: 'id', type: 3, description: 'ID do passaporte', required: true }
        ] 
    },
    { name: 'config_rh', description: '⚙️ Abre o painel de configuração de permissões de RH' },
    { name: 'painel_entrada', description: '🏥 Envia o painel de registro/recepção no canal atual' },
    { name: 'ponto', description: '⏱️ Envia o painel de bate-ponto no canal atual' },
    { name: 'atualizar', description: '📊 Força a atualização manual imediata de todos os quadros de hierarquia' },
    { 
        name: 'promover', 
        description: '🚀 Promove um funcionário para o próximo cargo', 
        options: [
            { name: 'membro', type: 6, description: 'Membro a ser promovido', required: true },
            { name: 'motivo', type: 3, description: 'Motivo da promoção', required: false }
        ] 
    },
    { 
        name: 'rebaixar', 
        description: '🔻 Rebaixa um funcionário para o cargo anterior', 
        options: [
            { name: 'membro', type: 6, description: 'Membro a ser rebaixado', required: true },
            { name: 'motivo', type: 3, description: 'Motivo do rebaixamento', required: true }
        ] 
    },
    { name: 'exonerar', description: '❌ Demite um funcionário, limpando sua ficha e cargos', options: [{ name: 'membro', type: 6, description: 'Membro a ser demitido', required: true }] },
    { name: 'advertir', description: '⚠️ Aplica uma advertência formal a um funcionário', options: [{ name: 'membro', type: 6, description: 'Funcionário', required: true }, { name: 'motivo', type: 3, description: 'Motivo', required: true }] },
    { name: 'advertencias', description: '🔍 Consulta o histórico de advertências de um funcionário', options: [{ name: 'membro', type: 6, description: 'Funcionário', required: true }] },
    { name: 'embed', description: '📢 Envia uma mensagem personalizada (Embed)', options: [{ name: 'titulo', type: 3, description: 'Título', required: true }, { name: 'descricao', type: 3, description: 'Texto', required: true }, { name: 'cor', type: 3, description: 'Cor em HEX', required: false }] },
    {
        name: 'config',
        description: '⚙️ Configura o logo, nome e cor do servidor nos painéis',
        options: [
            { name: 'logo', type: 3, description: 'URL da imagem do logo (cole o link da imagem do Discord)', required: false },
            { name: 'nome', type: 3, description: 'Nome do servidor (ex: Hospital - Paulista)', required: false },
            { name: 'cor', type: 3, description: 'Cor em HEX (ex: #ff0000)', required: false }
        ]
    },
    { name: 'set', description: '📋 Envia o painel do Sistema de Registro no canal atual' },

    { name: 'ponto_ranking', description: '📊 Exibe o ranking de horas trabalhadas no bate-ponto' },
    { name: 'ponto_relatorio', description: '📋 Exibe seu relatório individual de ponto (horas da semana e do mês)' },
    { 
        name: 'ponto_reset', 
        description: '🔄 Reseta o ranking de ponto (todos ou um membro específico)',
        options: [
            { name: 'membro', type: 6, description: 'Membro específico para resetar (deixe vazio para resetar todos)', required: false }
        ]
    },
    {
        name: 'ponto_config',
        description: '⚙️ Configura o reset automático do ranking (semanal/mensal/manual)',
        options: [
            { name: 'modo', type: 3, description: 'Modo de reset automático', required: true, choices: [
                { name: 'Semanal (toda segunda-feira)', value: 'semanal' },
                { name: 'Mensal (todo dia 1)', value: 'mensal' },
                { name: 'Manual (só com /ponto_reset)', value: 'manual' }
            ]}
        ]
    }
];

// ==========================================
// 5. EVENTO: BOT ONLINE & AUTO-UPDATE
// ==========================================
client.once('ready', async () => {
    console.log(`🏥 Bot ${client.user.tag} conectado com sucesso!`);
    
    try {
        console.log('🔄 Sincronizando comandos de barra...');
        for (const guild of client.guilds.cache.values()) {
            await guild.commands.set(comandos);
            console.log(`Comandos slash sincronizados no servidor: ${guild.name}`);
        }
        console.log('✅ Comandos slash sincronizados com o Discord!');
    } catch (error) {
        console.error('❌ Erro nos comandos slash:', error);
    }

    // ⏱️ TIMER AUTOMÁTICO: Atualiza as duas hierarquias a cada 5 segundos
    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.members.fetch();
            await atualizarQuadroFuncionarios(guild);
            await atualizarQuadroPsicologia(guild);
        } catch (err) {
            console.error("Erro na atualizacao inicial de quadros:", err);
        }
    }

    setInterval(async () => {
        for (const guild of client.guilds.cache.values()) {
            try {
                await guild.members.fetch();
                await atualizarQuadroFuncionarios(guild);
                await atualizarQuadroPsicologia(guild);
            } catch (err) {
                console.error("Erro na varredura automática de quadros:", err);
            }
        }

        // Auto-reset do ranking de ponto
        if (pontoResetConfig.modo) {
            const agora = new Date();
            const ultimo = new Date(pontoResetConfig.ultimoReset);
            let resetar = false;

            if (pontoResetConfig.modo === 'semanal' && agora.getDay() === 1) {
                if (ultimo.toDateString() !== agora.toDateString()) resetar = true;
            }
            if (pontoResetConfig.modo === 'mensal' && agora.getDate() === 1) {
                if (ultimo.toDateString() !== agora.toDateString()) resetar = true;
            }

            if (resetar) {
                rankingPonto.clear();
                historicoPonto.clear();
                pontoResetConfig.ultimoReset = Date.now();
                console.log(`📊 Ranking de ponto resetado automaticamente (${pontoResetConfig.modo}).`);
            }
        }
    }, 120000);
});

// ==========================================
// 6A. FUNÇÃO: ATUALIZAR QUADRO FUNCIONÁRIOS
// ==========================================
async function buscarCanalTexto(guild, canalId, nomeCanal) {
    const canal = guild.channels.cache.get(canalId) || await guild.channels.fetch(canalId).catch(() => null);

    if (!canal) return null;

    if (typeof canal.isTextBased === 'function' && !canal.isTextBased()) return null;

    return canal;
}

async function atualizarQuadroFuncionarios(guild) {
    const canalQuadro = await buscarCanalTexto(guild, CANAIS.HIERARQUIA, 'HIERARQUIA');
    if (!canalQuadro) return; 

    const embed = new EmbedBuilder()
        .setTitle("📊 QUADRO OFICIAL DE FUNCIONÁRIOS")
        .setDescription("Listagem dinâmica e em tempo real de todo o corpo corporativo e operacional do hospital.")
        .setColor("#2b2d31")
        .setTimestamp();

    const categoriesQuadro = [
        {
            nome: "⭐ 👑 DIREÇÃO GERAL",
            cargos: [
                { id: CARGOS.DIRETOR_GERAL, label: "👑 Diretor Geral" },
                { id: CARGOS.DIRETOR, label: "👔 Diretor(a)" },
                { id: CARGOS.VICE_DIRETOR, label: "📋 Vice-Diretor(a)" }
            ]
        },
        {
            nome: "🛡️ GESTÃO & COORDENAÇÃO",
            cargos: [
                { id: CARGOS.COORDENADOR, label: "📊 Coordenador(a)" },
                { id: CARGOS.SUPERVISOR, label: "📈 Supervisor(a)" }
            ]
        },
        {
            nome: "🩺 CHEFIAS DE ESPECIALIDADES",
            cargos: [
                { id: CARGOS.CHEFE_CIRURGIA, label: "🔪 Chefe de Cirurgia" },
                { id: CARGOS.CHEFE_SAMU, label: "🚑 Chefe do SAMU" },
                { id: CARGOS.CHEFE_PSICOLOGIA, label: "🧠 Chefe de Psicologia" },
                { id: CARGOS.CHEFE_OBSTETRICIA, label: "🤰 Chefe de Obstetrícia" },
                { id: CARGOS.CHEFE_PEDIATRIA, label: "👶 Chefe de Pediatria" }
            ]
        },
        {
            nome: "💉 CORPO MÉDICO ESPECIALIZADO",
            cargos: [
                { id: CARGOS.CIRURGIAO, label: "🔪 Cirurgião" },
                { id: CARGOS.PSICOLOGO, label: "🧠 Psicólogo" },
                { id: CARGOS.OBSTETRA, label: "🤰 Obstetra" },
                { id: CARGOS.PEDIATRA, label: "👶 Pediatra" }
            ]
        },
        {
            nome: "💊 ATENDIMENTO GERAL",
            cargos: [
                { id: CARGOS.MEDICA_CHEFE_F, label: "👩‍⚕️ Médica Chefe" },
                { id: CARGOS.MEDICO_CHEFE_M, label: "👨‍⚕️ Médico Chefe" },
                { id: CARGOS.MEDICO, label: "🩺 Médico" },
                { id: CARGOS.PARAMEDICO, label: "Avisos / Paramedico" },
                { id: CARGOS.ENFERMEIRO, label: "💉 Enfermeiro" }
            ]
        },
        {
            nome: "📝 INICIAÇÃO",
            cargos: [
                { id: CARGOS.ESTAGIARIO, label: "📚 Estagiário" }
            ]
        }
    ];

    let totalFuncionariosGeral = 0;

    for (const categoria of categoriesQuadro) {
        let conteudoDaCategoria = "";

        for (const itemCargo of categoria.cargos) {
            const cargoObj = guild.roles.cache.get(itemCargo.id);
            if (!cargoObj) continue;

            const membrosFiltrados = guild.members.cache.filter(m => m.roles.cache.has(itemCargo.id)).map(m => `↳ ${m.toString()}`);
            const totalNoCargo = membrosFiltrados.length;
            
            if (itemCargo.id !== CARGOS.PACIENTE) {
                totalFuncionariosGeral += totalNoCargo;
            }

            conteudoDaCategoria += `**${cargoObj.toString()}** [${totalNoCargo}]\n`;
            if (totalNoCargo > 0) {
                conteudoDaCategoria += membrosFiltrados.join('\n') + '\n\n';
            } else {
                conteudoDaCategoria += `↳ Cargo Vago\n\n`;
            }
        }

        if (conteudoDaCategoria.trim().length > 0) {
            embed.addFields({ name: categoria.nome, value: conteudoDaCategoria, inline: false });
        }
    }

    embed.setFooter({ text: `👥 Total de Profissionais Ativos: ${totalFuncionariosGeral}` });

    const mensagens = await canalQuadro.messages.fetch({ limit: 10 }).catch(() => new Map());
    const painelAntigo = mensagens.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes("QUADRO OFICIAL"));

    if (painelAntigo) {
        await painelAntigo.edit({ embeds: [embed] });
    } else {
        await canalQuadro.send({ embeds: [embed] });
    }
}

// ==========================================
// 6B. FUNÇÃO: ATUALIZAR QUADRO DA PSICOLOGIA
// ==========================================
async function atualizarQuadroPsicologia(guild, canalDestino = null) {
    const canalPsi = canalDestino || await buscarCanalTexto(guild, CANAIS.HIERARQUIA_PSICOLOGIA, 'HIERARQUIA_PSICOLOGIA');
    if (!canalPsi) return;
    if (typeof canalPsi.isTextBased === 'function' && !canalPsi.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle("🧠 QUADRO OFICIAL — DEPARTAMENTO DE PSICOLOGIA")
        .setDescription("Listagem dinâmica e em tempo real de todo o corpo profissional do Departamento de Psicologia Clínica.")
        .setColor("#9b59b6")
        .setTimestamp();

    const categoriasPsicologia = [
        {
            nome: "👑 CHEFIA DA PSICOLOGIA",
            cargos: [
                { id: CARGOS.CHEFE_PSICOLOGIA, label: "👑 Chefe de Psicologia" }
            ]
        },
        {
            nome: "🛡️ GESTÃO & COORDENAÇÃO",
            cargos: [
                { id: CARGOS.COORDENADOR_PSICOLOGIA, label: "📋 Coordenador(a)" },
                { id: CARGOS.SUPERVISOR_PSICOLOGIA, label: "📈 Supervisor(a)" }
            ]
        },
        {
            nome: "🧠 CORPO CLÍNICO",
            cargos: [
                { id: CARGOS.PSICOLOGO, label: "🧠 Psicólogo(a)" }
            ]
        },
        {
            nome: "📝 INICIAÇÃO",
            cargos: [
                { id: CARGOS.AUXILIAR_PSICOLOGIA, label: "📝 Auxiliar da Psicologia" }
            ]
        }
    ];

    let totalPsicologia = 0;

    for (const categoria of categoriasPsicologia) {
        let conteudoDaCategoria = "";

        for (const itemCargo of categoria.cargos) {
            const cargoObj = guild.roles.cache.get(itemCargo.id);
            if (!cargoObj) continue;

            const membrosFiltrados = guild.members.cache.filter(m => m.roles.cache.has(itemCargo.id)).map(m => `↳ ${m.toString()}`);
            const totalNoCargo = membrosFiltrados.length;
            totalPsicologia += totalNoCargo;

            conteudoDaCategoria += `**${cargoObj.toString()}** [${totalNoCargo}]\n`;
            if (totalNoCargo > 0) {
                conteudoDaCategoria += membrosFiltrados.join('\n') + '\n\n';
            } else {
                conteudoDaCategoria += `↳ Cargo Vago\n\n`;
            }
        }

        if (conteudoDaCategoria.trim().length > 0) {
            embed.addFields({ name: categoria.nome, value: conteudoDaCategoria, inline: false });
        }
    }

    embed.setFooter({ text: `🧠 Total de Profissionais na Psicologia: ${totalPsicologia}` });

    const mensagens = await canalPsi.messages.fetch({ limit: 10 }).catch(() => new Map());
    const painelAntigo = mensagens.find(m => m.author.id === client.user.id && m.embeds[0]?.title?.includes("PSICOLOGIA"));

    if (painelAntigo) {
        await painelAntigo.edit({ embeds: [embed] });
    } else {
        await canalPsi.send({ embeds: [embed] });
    }
}

// ==========================================
// 7. GERENCIADOR DE EVENTOS E INTERAÇÕES
// ==========================================
client.on('interactionCreate', async interaction => {
    try {

    function verificarPermissaoRH(funcao) {
        const cargoPermitidoId = permissoesRH[funcao];
        const eDiretorGeral = interaction.member.roles.cache.has(ID_DIRETOR_GERAL);
        const eAdminNativo = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (eDiretorGeral || eAdminNativo) return true;
        if (cargoPermitidoId && interaction.member.roles.cache.has(cargoPermitidoId)) return true;
        return false;
    }

    async function limparTagsDoNome(membro) {
        let nomeLimpo = membro.displayName;
        nomeLimpo = nomeLimpo.replace(/^[\{\[][A-Za-z]+[\}\]]\s*/g, "");
        return nomeLimpo.trim();
    }

    if (interaction.isChatInputCommand()) {
        const { commandName, options } = interaction;

        if (commandName === 'setar_apelido') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return interaction.reply({ content: "❌ Você não tem permissão para gerenciar apelidos.", ephemeral: true });
            }

            const membro = options.getMember('membro');
            const tag = options.getString('tag');
            const nome = options.getString('nome');
            const id = options.getString('id');

            const novoApelido = `{${tag}} ${nome} | ${id}`;

            try {
                await membro.setNickname(novoApelido);
                await interaction.reply({ content: `✅ Apelido definido para: **${novoApelido}**`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: "❌ Erro ao alterar apelido. Certifique-se de que o cargo do bot está acima do cargo do membro.", ephemeral: true });
            }
        }

        if (commandName === 'atualizar') {
            if (!interaction.member.roles.cache.has(ID_DIRETOR_GERAL) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Apenas a **Direção Geral** ou Administradores podem gerenciar o quadro de hierarquia.", ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            try {
                await interaction.guild.members.fetch();
                await atualizarQuadroFuncionarios(interaction.guild);
                await atualizarQuadroPsicologia(interaction.guild);
                return interaction.editReply({ content: "✅ Todos os quadros de hierarquia foram atualizados com sucesso!" });
            } catch (error) {
                console.error("Erro ao atualizar quadros:", error);
                return interaction.editReply({ content: `⚠️ Erro: ${error.message}` });
            }
        }

        if (commandName === 'config_rh') {
            if (!interaction.member.roles.cache.has(ID_DIRETOR_GERAL) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Apenas o **Diretor Geral** possui autoridade para usar este configurador.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle("⚙️ Painel de Configuração de Permissões - RH")
                .setDescription("Escolha qual **ação operacional** você deseja delegar permissões neste momento:")
                .setColor("#5865F2");

            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_selecionar_funcao')
                    .setPlaceholder('Escolha a função operacional...')
                    .addOptions([
                        { label: 'Promover Funcionários', value: 'promover', description: 'Permissão para usar o comando /promover' },
                        { label: 'Rebaixar Funcionários', value: 'rebaixar', description: 'Permissão para usar o comando /rebaixar' },
                        { label: 'Advertir Funcionários', value: 'advertir', description: 'Permissão para usar o comando /advertir' },
                        { label: 'Demitir / Exonerar', value: 'exonerar', description: 'Permissão para usar o comando /exonerar' },
                        { label: 'Aceitar / Rejeitar Fichas', value: 'fichas', description: 'Permissão para validar novos cadastros' },
                    ])
            );

            return interaction.reply({ embeds: [embed], components: [menu], ephemeral: true });
        }

        if (commandName === 'painel_entrada') {
            const embed = new EmbedBuilder()
                .setAuthor({ name: configServidor.nome, iconURL: configServidor.logo || undefined })
                .setTitle("🏥 Central de Recepção & Triagem")
                .setDescription(`Seja muito bem-vindo(a) ao **${configServidor.nome}**!\n\nPara dar início aos seus atendimentos ou registrar a sua entrada na equipe profissional, clique no botão abaixo para preencher sua ficha.\n\n━━━━━━━━━━━━━━━━━━━━━━\n📋 Preencha todos os campos com atenção.\n⏳ Aguarde a análise da equipe de RH.\n✅ Você será notificado sobre o resultado.\n━━━━━━━━━━━━━━━━━━━━━━`)
                .setColor(configServidor.cor)
                .setThumbnail(configServidor.logo || undefined)
                .setFooter({ text: `© ${configServidor.nome} ${new Date().getFullYear()}`, iconURL: configServidor.logo || undefined })
                .setTimestamp();

            const botao = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_abrir_ficha').setLabel('Solicitar Registro / Ficha').setStyle(ButtonStyle.Danger).setEmoji('📝')
            );

            await interaction.reply({ content: "✅ Painel de entrada enviado.", ephemeral: true });
            return interaction.channel.send({ embeds: [embed], components: [botao] });
        }

        if (commandName === 'set') {
            const embed = new EmbedBuilder()
                .setAuthor({ name: configServidor.nome, iconURL: configServidor.logo || undefined })
                .setTitle("📋 Sistema de Registro")
                .setDescription(`Este é o **menu para a equipe** que concede o acesso para utilizar todas as funções relacionadas à equipe dentro do bot.\n\n━━━━━━━━━━━━━━━━━━━━━━\nℹ️ Caso você ainda não possua um registro, clique no botão \'Registrar-se\' para ser incluído dentro de nossa equipe.\n━━━━━━━━━━━━━━━━━━━━━━`)
                .setColor(configServidor.cor)
                .setThumbnail(configServidor.logo || undefined)
                .setFooter({ text: `© ${configServidor.nome} ${new Date().getFullYear()}`, iconURL: configServidor.logo || undefined })
                .setTimestamp();

            const botoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('set_registrar').setLabel('Registrar-se').setStyle(ButtonStyle.Danger).setEmoji('👤'),
                new ButtonBuilder().setCustomId('set_perfil').setLabel('Perfil').setStyle(ButtonStyle.Secondary).setEmoji('👤')
            );

            await interaction.reply({ content: "✅ Painel de registro enviado.", ephemeral: true });
            return interaction.channel.send({ embeds: [embed], components: [botoes] });
        }

        if (commandName === 'ponto') {
            const embed = new EmbedBuilder()
                .setAuthor({ name: configServidor.nome, iconURL: configServidor.logo || undefined })
                .setTitle("⏱️ Registro Eletrônico de Ponto")
                .setDescription(`Funcionário, utilize este terminal digital para registrar sua jornada de trabalho.\n\n━━━━━━━━━━━━━━━━━━━━━━\n🟢 **Entrar** — Inicia seu turno de serviço\n⏸️ **Pausar** — Pausa o turno (almoço, intervalo)\n▶️ **Retomar** — Retoma o turno após pausa\n🔴 **Sair** — Encerra o turno e registra as horas\n━━━━━━━━━━━━━━━━━━━━━━\n⏳ O tempo de serviço e pausas será computado automaticamente.`)
                .setColor(configServidor.cor)
                .setThumbnail(configServidor.logo || undefined)
                .setFooter({ text: `© ${configServidor.nome} ${new Date().getFullYear()}`, iconURL: configServidor.logo || undefined })
                .setTimestamp();

            const botoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ponto_entrar').setLabel('Entrar').setStyle(ButtonStyle.Success).setEmoji('🟢'),
                new ButtonBuilder().setCustomId('ponto_pausar').setLabel('Pausar').setStyle(ButtonStyle.Primary).setEmoji('⏸️'),
                new ButtonBuilder().setCustomId('ponto_retomar').setLabel('Retomar').setStyle(ButtonStyle.Primary).setEmoji('▶️'),
                new ButtonBuilder().setCustomId('ponto_sair').setLabel('Sair').setStyle(ButtonStyle.Danger).setEmoji('🔴')
            );

            await interaction.reply({ content: "✅ Painel de Bate-ponto enviado.", ephemeral: true });
            return interaction.channel.send({ embeds: [embed], components: [botoes] });
        }

        if (commandName === 'promover') {
            if (!verificarPermissaoRH('promover')) return interaction.reply({ content: "❌ Você não tem permissão de RH configurada para promover membros.", ephemeral: true });
            
            const membro = options.getMember('membro');
            const motivo = options.getString('motivo') || "Desempenho exemplar demonstrado em serviço.";
            let atualCargoIdx = -1;

            for (let i = 0; i < ORDEM_CARGOS.length; i++) {
                if (membro.roles.cache.has(ORDEM_CARGOS[i])) atualCargoIdx = i;
            }

            if (atualCargoIdx === -1 || atualCargoIdx === ORDEM_CARGOS.length - 1) {
                return interaction.reply({ content: "❌ Este membro já atingiu o topo hierárquico ou não possui cargo válido registrado.", ephemeral: true });
            }

            const antigoCargoId = ORDEM_CARGOS[atualCargoIdx];
            const novoCargoId = ORDEM_CARGOS[atualCargoIdx + 1];

            if (antigoCargoId !== CARGOS.PACIENTE) await membro.roles.remove(antigoCargoId);
            await membro.roles.add(novoCargoId);

            const nomeLimpo = await limparTagsDoNome(membro);
            const novoPrefixo = PREFIXOS[novoCargoId] || "";
            await membro.setNickname(`${novoPrefixo} ${nomeLimpo}`).catch(() => {});

            const embedPromocao = new EmbedBuilder()
                .setTitle("🏥 Promoção Oficial")
                .setColor("#0099ff")
                .setDescription("🎉 **Parabéns pela Promoção!**\n\nO colaborador demonstrou dedicação, comprometimento e excelência em suas atividades, conquistando com mérito sua ascensão dentro da instituição.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                .addFields(
                    { name: "👤 Colaborador(a)", value: `${membro.toString()}`, inline: true },
                    { name: "🛡️ Autorizado por", value: `${interaction.user.toString()}`, inline: true },
                    { name: "\u200B", value: "\u200B", inline: false },
                    { name: "📉 Cargo Anterior", value: `<@&${antigoCargoId}>`, inline: true },
                    { name: "📈 Cargo Atual", value: `<@&${novoCargoId}>`, inline: true },
                    { name: "📝 Motivo Referência", value: `${motivo}`, inline: false }
                )
                .setFooter({ text: "🏥 Hospital HP • Cuidando de vidas." })
                .setTimestamp();

            await interaction.reply({ embeds: [embedPromocao] });
            
            const canalLogs = interaction.guild.channels.cache.get(CANAIS.LOGS_RH);
            if (canalLogs) canalLogs.send({ embeds: [embedPromocao] });
            
            await atualizarQuadroFuncionarios(interaction.guild);
            return atualizarQuadroPsicologia(interaction.guild);
        }

        if (commandName === 'rebaixar') {
            if (!verificarPermissaoRH('rebaixar')) return interaction.reply({ content: "❌ Você não tem permissão de RH configurada para rebaixar membros.", ephemeral: true });

            const membro = options.getMember('membro');
            const motivo = options.getString('motivo');
            let atualCargoIdx = -1;

            for (let i = 0; i < ORDEM_CARGOS.length; i++) {
                if (membro.roles.cache.has(ORDEM_CARGOS[i])) atualCargoIdx = i;
            }

            if (atualCargoIdx <= 1) { 
                return interaction.reply({ content: "❌ Este membro não pode ser rebaixado abaixo do cargo base. Se deseja desligá-lo, use `/exonerar`.", ephemeral: true });
            }

            const antigoCargoId = ORDEM_CARGOS[atualCargoIdx];
            const novoCargoId = ORDEM_CARGOS[atualCargoIdx - 1];

            await membro.roles.remove(antigoCargoId);
            await membro.roles.add(novoCargoId);

            const nomeLimpo = await limparTagsDoNome(membro);
            const novoPrefixo = PREFIXOS[novoCargoId] || "";
            await membro.setNickname(`${novoPrefixo} ${nomeLimpo}`).catch(() => {});

            const embedRebaixamento = new EmbedBuilder()
                .setTitle("🏥 Readequação de Cargo")
                .setColor("#e74c3c")
                .setDescription("⚠️ **Aviso Oficial de Readequação**\n\nInformamos que foi realizada uma alteração na hierarquia deste colaborador para alinhar com os padrões do Hospital HP.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
                .addFields(
                    { name: "👤 Colaborador(a)", value: `${membro.toString()}`, inline: true },
                    { name: "🛡️ Autorizado por", value: `${interaction.user.toString()}`, inline: true },
                    { name: "\u200B", value: "\u200B", inline: false },
                    { name: "📈 Cargo Anterior", value: `<@&${antigoCargoId}>`, inline: true },
                    { name: "📉 Cargo Atual", value: `<@&${novoCargoId}>`, inline: true },
                    { name: "📝 Motivo", value: `${motivo}`, inline: false }
                )
                .setFooter({ text: "🏥 Hospital HP • Gestão de Equipe." })
                .setTimestamp();

            await interaction.reply({ embeds: [embedRebaixamento] });
            
            const canalLogs = interaction.guild.channels.cache.get(CANAIS.LOGS_RH);
            if (canalLogs) canalLogs.send({ embeds: [embedRebaixamento] });
            
            await atualizarQuadroFuncionarios(interaction.guild);
            return atualizarQuadroPsicologia(interaction.guild);
        }

        if (commandName === 'exonerar') {
            if (!verificarPermissaoRH('exonerar')) return interaction.reply({ content: "❌ Você não tem permissão de RH configurada para exonerar membros.", ephemeral: true });

            const membro = options.getMember('membro');

            for (const cargoId of ORDEM_CARGOS) {
                if (cargoId !== CARGOS.PACIENTE && membro.roles.cache.has(cargoId)) {
                    await membro.roles.remove(cargoId).catch(() => {});
                }
            }

            await membro.roles.add(CARGOS.PACIENTE).catch(() => {});
            const nomeLimpo = await limparTagsDoNome(membro);
            await membro.setNickname(nomeLimpo).catch(() => {});

            await interaction.reply({ content: `❌ O funcionário ${membro.toString()} foi totalmente exonerado de suas funções médicas.` });
            
            const canalLogs = interaction.guild.channels.cache.get(CANAIS.LOGS_RH);
            if (canalLogs) canalLogs.send(`❌ **EXONERAÇÃO:** ${interaction.user.tag} desligou ${membro.toString()} da equipe.`);
            
            await atualizarQuadroFuncionarios(interaction.guild);
            return atualizarQuadroPsicologia(interaction.guild);
        }

        if (commandName === 'advertir') {
            if (!verificarPermissaoRH('advertir')) return interaction.reply({ content: "❌ Você não tem permissão de RH configurada para aplicar advertências.", ephemeral: true });

            const membro = options.getMember('membro');
            const motivo = options.getString('motivo');

            if (!advertenciasBanco.has(membro.id)) advertenciasBanco.set(membro.id, []);
            const listaAdv = advertenciasBanco.get(membro.id);
            listaAdv.push({ motivo, data: new Date(), por: interaction.user.tag });

            await interaction.reply({ content: `⚠️ Advertência aplicada com sucesso para ${membro.toString()}.\n**Motivo:** ${motivo} *(Total: ${listaAdv.length}/3)*` });

            if (listaAdv.length >= 3) {
                const canalLogs = interaction.guild.channels.cache.get(CANAIS.LOGS_RH);
                if (canalLogs) canalLogs.send(`🚨 **ALERTA CRÍTICO:** O funcionário ${membro.toString()} atingiu o limite máximo de **${listaAdv.length} advertências**!`);
            }
            return;
        }

        if (commandName === 'advertencias') {
            const membro = options.getMember('membro');
            const listaAdv = advertenciasBanco.get(membro.id) || [];

            if (listaAdv.length === 0) return interaction.reply({ content: `✅ O funcionário ${membro.toString()} possui uma ficha limpa.`, ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`🔍 Histórico de Advertências - ${membro.displayName}`)
                .setColor("#ffcc00");

            listaAdv.forEach((adv, index) => {
                embed.addFields({ name: `Advertência #${index + 1}`, value: `**Motivo:** ${adv.motivo}\n**Por:** ${adv.por}\n**Data:** ${adv.data.toLocaleDateString('pt-BR')}` });
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (commandName === 'embed') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({ content: "❌ Você não tem permissões para estruturar comunicados.", ephemeral: true });
            }
            const titulo = options.getString('titulo');
            const descricao = options.getString('descricao').replace(/\\n/g, '\n');
            const cor = options.getString('cor') || '#ffffff';

            const embedCustom = new EmbedBuilder().setTitle(titulo).setDescription(descricao).setColor(cor.startsWith('#') ? cor : '#ffffff');
            await interaction.reply({ content: "✅ Comunicado gerado.", ephemeral: true });
            return interaction.channel.send({ embeds: [embedCustom] });
        }

        // ==========================================
        // COMANDO /CONFIG
        // ==========================================
        if (commandName === 'config') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Apenas Administradores podem configurar o servidor.", ephemeral: true });
            }

            const logo = options.getString('logo');
            const nome = options.getString('nome');
            const cor = options.getString('cor');

            let resposta = "⚙️ **Configuração do servidor atualizada:**\n";
            let mudou = false;

            if (logo) { configServidor.logo = logo; resposta += `🖼️ Logo: [Imagem definida]\n`; mudou = true; }
            if (nome) { configServidor.nome = nome; resposta += `📝 Nome: **${nome}**\n`; mudou = true; }
            if (cor) { configServidor.cor = cor.startsWith('#') ? cor : `#${cor}`; resposta += `🎨 Cor: **${configServidor.cor}**\n`; mudou = true; }

            if (!mudou) {
                resposta = `⚙️ **Configuração atual:**\n🖼️ Logo: ${configServidor.logo ? '✅ Definido' : '❌ Não definido'}\n📝 Nome: **${configServidor.nome}**\n🎨 Cor: **${configServidor.cor}**`;
            }

            return interaction.reply({ content: resposta, ephemeral: true });
        }

        // ==========================================
        // COMANDOS DE RANKING DE PONTO
        // ==========================================
        if (commandName === 'ponto_ranking') {
            if (rankingPonto.size === 0) {
                return interaction.reply({ content: "📊 Nenhum registro de ponto encontrado ainda.", ephemeral: true });
            }

            const ranking = [...rankingPonto.entries()]
                .sort((a, b) => b[1].minutos - a[1].minutos)
                .slice(0, 15);

            const medalhas = ['🥇', '🥈', '🥉'];
            let descricao = '';

            ranking.forEach(([userId, dados], index) => {
                const horas = Math.floor(dados.minutos / 60);
                const mins = dados.minutos % 60;
                const turnos = dados.turnos || 0;
                const medalha = medalhas[index] || `**${index + 1}.**`;
                descricao += `${medalha} <@${userId}> — **${horas}h ${mins}m** (${turnos} turnos)\n`;
            });

            const modoTexto = pontoResetConfig.modo === 'semanal' ? '🔄 Reset: Semanal (toda segunda)' : pontoResetConfig.modo === 'mensal' ? '🔄 Reset: Mensal (todo dia 1)' : '🔄 Reset: Manual';

            const embed = new EmbedBuilder()
                .setAuthor({ name: configServidor.nome, iconURL: configServidor.logo || undefined })
                .setTitle("📊 Ranking de Bate-Ponto")
                .setDescription(`${descricao}\n━━━━━━━━━━━━━━━━━━━━━━\n${modoTexto}`)
                .setColor(configServidor.cor)
                .setThumbnail(configServidor.logo || undefined)
                .setFooter({ text: `© ${configServidor.nome} ${new Date().getFullYear()}`, iconURL: configServidor.logo || undefined })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        if (commandName === 'ponto_relatorio') {
            const userId = interaction.user.id;
            const historico = historicoPonto.get(userId) || [];
            const dadosRank = rankingPonto.get(userId);

            const agora = new Date();
            const inicioSemana = new Date(agora);
            inicioSemana.setDate(agora.getDate() - agora.getDay());
            inicioSemana.setHours(0, 0, 0, 0);

            const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

            let minutosSemana = 0, turnosSemana = 0;
            let minutosMes = 0, turnosMes = 0;

            for (const reg of historico) {
                const dataReg = new Date(reg.data);
                if (dataReg >= inicioMes) {
                    minutosMes += reg.duracao;
                    turnosMes++;
                }
                if (dataReg >= inicioSemana) {
                    minutosSemana += reg.duracao;
                    turnosSemana++;
                }
            }

            const formatTempo = (min) => `${Math.floor(min / 60)}h ${min % 60}m`;

            const ultimosTurnos = historico.slice(-5).reverse().map((reg, i) => {
                const data = new Date(reg.data).toLocaleDateString('pt-BR');
                return `${i + 1}. ${data} — **${formatTempo(reg.duracao)}** (pausas: ${formatTempo(reg.pausas)})`;
            }).join('\n') || 'Nenhum turno registrado.';

            const statusAtual = pontosAtivos.has(userId) ? (pontosAtivos.get(userId).pausaAtual ? '⏸️ Pausado' : '🟢 Em serviço') : '⚪ Offline';

            const embed = new EmbedBuilder()
                .setAuthor({ name: configServidor.nome, iconURL: configServidor.logo || undefined })
                .setTitle(`📋 Relatório de Ponto — ${interaction.user.tag}`)
                .setDescription(`Status atual: **${statusAtual}**\n━━━━━━━━━━━━━━━━━━━━━━`)
                .addFields(
                    { name: '📅 Esta Semana', value: `⏱️ ${formatTempo(minutosSemana)}\n📋 ${turnosSemana} turnos`, inline: true },
                    { name: '📆 Este Mês', value: `⏱️ ${formatTempo(minutosMes)}\n📋 ${turnosMes} turnos`, inline: true },
                    { name: '📊 Total Acumulado', value: `⏱️ ${dadosRank ? formatTempo(dadosRank.minutos) : '0h 0m'}\n📋 ${dadosRank ? (dadosRank.turnos || 0) : 0} turnos`, inline: true },
                    { name: '🕐 Últimos 5 Turnos', value: ultimosTurnos, inline: false }
                )
                .setColor(configServidor.cor)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: `© ${configServidor.nome} ${new Date().getFullYear()}`, iconURL: configServidor.logo || undefined })
                .setTimestamp();

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (commandName === 'ponto_reset') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Apenas Administradores podem resetar o ranking.", ephemeral: true });
            }

            const membro = options.getMember('membro');

            if (membro) {
                rankingPonto.delete(membro.id);
                historicoPonto.delete(membro.id);
                return interaction.reply({ content: `🔄 Ponto de ${membro.toString()} foi resetado.`, ephemeral: true });
            }

            rankingPonto.clear();
            historicoPonto.clear();
            pontoResetConfig.ultimoReset = Date.now();
            return interaction.reply({ content: "🔄 **Ranking de ponto resetado!** Todos os registros foram limpos.", ephemeral: true });
        }

        if (commandName === 'ponto_config') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "❌ Apenas Administradores podem configurar o reset.", ephemeral: true });
            }

            const modo = options.getString('modo');
            pontoResetConfig.modo = modo === 'manual' ? null : modo;

            const textos = {
                'semanal': '📊 Reset automático configurado para **toda segunda-feira**.',
                'mensal': '📊 Reset automático configurado para **todo dia 1 do mês**.',
                'manual': '📊 Reset automático **desativado**. Use `/reset_ponto` para resetar manualmente.'
            };

            return interaction.reply({ content: textos[modo], ephemeral: true });
        }



    }

    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'set_escolher_cargo') {
            const cargoEscolhido = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`modal_set_${cargoEscolhido}`)
                .setTitle('Formulário de Registro');

            const campoNome = new TextInputBuilder().setCustomId('set_nome').setLabel('Nome Completo').setStyle(TextInputStyle.Short).setRequired(true);
            const campoId = new TextInputBuilder().setCustomId('set_id').setLabel('Número do ID / Passaporte').setStyle(TextInputStyle.Short).setRequired(true);
            const campoTelefone = new TextInputBuilder().setCustomId('set_telefone').setLabel('Telefone').setStyle(TextInputStyle.Short).setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(campoNome),
                new ActionRowBuilder().addComponents(campoId),
                new ActionRowBuilder().addComponents(campoTelefone)
            );

            return interaction.showModal(modal);
        }

        if (interaction.customId === 'menu_selecionar_funcao') {
            const funcao = interaction.values[0];

            const menuCargos = new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId(`definir_cargo_rh_${funcao}`)
                    .setPlaceholder(`Selecione o cargo para delegar: ${funcao.toUpperCase()}`)
            );

            return interaction.update({
                content: `👉 Escolha abaixo qual o cargo do servidor receberá permissão ativa para executar a tarefa **[${funcao.toUpperCase()}]**:`,
                components: [menuCargos], embeds: []
            });
        }
    }

    if (interaction.isRoleSelectMenu()) {
        if (interaction.customId.startsWith('definir_cargo_rh_')) {
            const funcao = interaction.customId.replace('definir_cargo_rh_', '');
            const cargoId = interaction.values[0];
            const cargoNome = interaction.guild.roles.cache.get(cargoId).name;

            permissoesRH[funcao] = cargoId;

            return interaction.update({
                content: `✅ **Configuração Atualizada!**\nA partir de agora, membros com o cargo **${cargoNome}** têm permissão para a função: **${funcao.toUpperCase()}**.`,
                components: []
            });
        }
    }

    if (interaction.isButton()) {
        const customId = interaction.customId;

        if (customId === 'set_registrar') {
            const menu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('set_escolher_cargo')
                    .setPlaceholder('Escolha seu cargo...')
                    .addOptions([
                        { label: 'Paciente', value: 'paciente', description: 'Registro como Paciente (aprovação imediata)', emoji: '🏥' },
                        { label: 'Jurídico', value: 'juridico', description: 'Registro como Jurídico (requer aprovação)', emoji: '⚖️' },
                        { label: 'Polícia', value: 'policia', description: 'Registro como Polícia (requer aprovação)', emoji: '🚔' }
                    ])
            );

            return interaction.reply({ content: "👇 Escolha o cargo para o registro:", components: [menu], ephemeral: true });
        }

        if (customId === 'set_perfil') {
            const membro = interaction.member;
            const cargosDoMembro = [];
            const mapaCargos = {
                [CARGOS.PACIENTE]: "🏥 Paciente",
                [CARGOS.JURIDICO]: "⚖️ Jurídico",
                [CARGOS.POLICIA]: "🚔 Polícia",
                [CARGOS.ESTAGIARIO]: "📚 Estagiário",
                [CARGOS.ENFERMEIRO]: "💉 Enfermeiro",
                [CARGOS.PARAMEDICO]: "🚑 Paramédico",
                [CARGOS.MEDICO]: "🩺 Médico"
            };

            for (const [cargoId, cargoNome] of Object.entries(mapaCargos)) {
                if (membro.roles.cache.has(cargoId)) cargosDoMembro.push(cargoNome);
            }

            const embedPerfil = new EmbedBuilder()
                .setTitle(`👤 Perfil — ${membro.displayName}`)
                .setColor("#2b2d31")
                .addFields(
                    { name: "Usuário", value: membro.toString(), inline: true },
                    { name: "Apelido", value: membro.displayName || "Sem apelido", inline: true },
                    { name: "Cargos", value: cargosDoMembro.length > 0 ? cargosDoMembro.join(", ") : "Nenhum cargo registrado", inline: false }
                )
                .setThumbnail(membro.user.displayAvatarURL())
                .setTimestamp();

            return interaction.reply({ embeds: [embedPerfil], ephemeral: true });
        }

        if (customId.startsWith('set_aprovar_') || customId.startsWith('set_rejeitar_')) {
            if (!verificarPermissaoRH('fichas')) return interaction.reply({ content: "❌ Você não faz parte do setor autorizado a avaliar fichas.", ephemeral: true });

            const partes = customId.split('_');
            const acao = partes[1];
            const usuarioId = partes[2];

            const dadosFicha = fichasPendentes.get(usuarioId);
            if (!dadosFicha) return interaction.update({ content: "❌ Ficha não encontrada ou já processada.", components: [] });

            const membroCandidato = await interaction.guild.members.fetch(usuarioId).catch(() => null);
            if (!membroCandidato) return interaction.update({ content: "❌ O usuário saiu do servidor.", components: [] });

            if (acao === 'aprovar') {
                const cargoId = dadosFicha.cargoId;
                const tagCargo = PREFIXOS[cargoId] || "";

                await membroCandidato.roles.add(cargoId);
                await membroCandidato.setNickname(`${tagCargo} ${dadosFicha.nome} | ${dadosFicha.id}`).catch(() => {});

                await interaction.update({
                    content: `✅ **Ficha Aprovada por ${interaction.user.tag}!**\nO membro ${membroCandidato.toString()} foi registrado como <@&${cargoId}>.`,
                    components: [], embeds: []
                });
                await atualizarQuadroFuncionarios(interaction.guild);
            } else {
                await interaction.update({
                    content: `🔴 **Ficha Rejeitada por ${interaction.user.tag}.** O cadastro foi recusado.`,
                    components: [], embeds: []
                });
            }
            return fichasPendentes.delete(usuarioId);
        }

        if (customId === 'btn_abrir_ficha') {
            const modal = new ModalBuilder().setCustomId('modal_ficha_entrada').setTitle('Formulário de Entrada - Hospital');

            const campoNome = new TextInputBuilder().setCustomId('txt_nome').setLabel('Nome Completo (Modo RP)').setStyle(TextInputStyle.Short).setRequired(true);
            const campoId = new TextInputBuilder().setCustomId('txt_id').setLabel('Número do seu ID / Passaporte').setStyle(TextInputStyle.Short).setRequired(true);
            const campoCargo = new TextInputBuilder().setCustomId('txt_cargo').setLabel('Cargo Pretendido').setStyle(TextInputStyle.Short).setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(campoNome),
                new ActionRowBuilder().addComponents(campoId),
                new ActionRowBuilder().addComponents(campoCargo)
            );

            return interaction.showModal(modal);
        }

        if (customId.startsWith('rh_aprovar_') || customId.startsWith('rh_rejeitar_')) {
            if (!verificarPermissaoRH('fichas')) return interaction.reply({ content: "❌ Você não faz parte do setor de RH autorizado a avaliar fichas.", ephemeral: true });

            const partes = customId.split('_');
            const acao = partes[1]; 
            const usuarioId = partes[2];

            const dadosFicha = fichasPendentes.get(usuarioId);
            const membroCandidato = await interaction.guild.members.fetch(usuarioId).catch(() => null);

            if (!membroCandidato) return interaction.update({ content: "❌ O usuário correspondente a esta ficha saiu do servidor.", components: [] });

            if (acao === 'aprovar') {
                let cargoAlvoId = CARGOS.ESTAGIARIO; 
                let textoCargoPretendido = dadosFicha?.cargoSolicitado?.toLowerCase() || "";

                if (textoCargoPretendido.includes('paciente')) {
                    cargoAlvoId = CARGOS.PACIENTE;
                }

                await membroCandidato.roles.add(cargoAlvoId);
                const tagCargo = PREFIXOS[cargoAlvoId] || "";
                
                const nomeLimpo = await limparTagsDoNome(membroCandidato);
                await membroCandidato.setNickname(`${tagCargo} ${nomeLimpo}`).catch(() => {});

                await interaction.update({ content: `✅ **Ficha Aprovada por ${interaction.user.tag}!**\nO membro ${membroCandidato.toString()} foi registrado com o cargo <@&${cargoAlvoId}>.`, components: [], embeds: [] });
                await atualizarQuadroFuncionarios(interaction.guild);
                await atualizarQuadroPsicologia(interaction.guild);
            } else {
                await interaction.update({ content: `🔴 **Ficha Rejeitada por ${interaction.user.tag}.** O cadastro do membro foi arquivado/recusado.`, components: [], embeds: [] });
            }
            return fichasPendentes.delete(usuarioId);
        }

        if (customId === 'ponto_entrar') {
            if (pontosAtivos.has(interaction.user.id)) return interaction.reply({ content: "❌ Você já possui um turno ativo.", ephemeral: true });
            pontosAtivos.set(interaction.user.id, {
                entrada: Date.now(),
                pausas: [],
                pausaAtual: null,
                totalPausado: 0
            });

            const horaEntrada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            await interaction.reply({ content: `🟢 **Turno Iniciado às ${horaEntrada}!** Tenha um excelente plantão.`, ephemeral: true });

            const canalLogsPonto = interaction.guild.channels.cache.get(CANAIS.LOGS_PONTO);
            if (canalLogsPonto) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("🟢 Entrada de Serviço")
                    .setColor("#2ecc71")
                    .addFields(
                        { name: "Profissional", value: interaction.user.toString(), inline: true },
                        { name: "Horário", value: horaEntrada, inline: true }
                    )
                    .setTimestamp();
                canalLogsPonto.send({ embeds: [logEmbed] });
            }
            return;
        }

        if (customId === 'ponto_pausar') {
            if (!pontosAtivos.has(interaction.user.id)) return interaction.reply({ content: "❌ Você não está em serviço.", ephemeral: true });
            const dados = pontosAtivos.get(interaction.user.id);
            if (dados.pausaAtual) return interaction.reply({ content: "❌ Você já está em pausa.", ephemeral: true });

            dados.pausaAtual = Date.now();
            const horaPausa = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            await interaction.reply({ content: `⏸️ **Turno pausado às ${horaPausa}.** Use ▶️ Retomar quando voltar.`, ephemeral: true });

            const canalLogsPonto = interaction.guild.channels.cache.get(CANAIS.LOGS_PONTO);
            if (canalLogsPonto) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("⏸️ Pausa Iniciada")
                    .setColor("#f39c12")
                    .addFields(
                        { name: "Profissional", value: interaction.user.toString(), inline: true },
                        { name: "Horário", value: horaPausa, inline: true }
                    )
                    .setTimestamp();
                canalLogsPonto.send({ embeds: [logEmbed] });
            }
            return;
        }

        if (customId === 'ponto_retomar') {
            if (!pontosAtivos.has(interaction.user.id)) return interaction.reply({ content: "❌ Você não está em serviço.", ephemeral: true });
            const dados = pontosAtivos.get(interaction.user.id);
            if (!dados.pausaAtual) return interaction.reply({ content: "❌ Você não está em pausa.", ephemeral: true });

            const duracaoPausa = Date.now() - dados.pausaAtual;
            dados.pausas.push({ inicio: dados.pausaAtual, fim: Date.now() });
            dados.totalPausado += duracaoPausa;
            dados.pausaAtual = null;

            const minPausa = Math.floor(duracaoPausa / 60000);
            const horaRetorno = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            await interaction.reply({ content: `▶️ **Turno retomado às ${horaRetorno}!** Pausa de ${minPausa} minutos registrada.`, ephemeral: true });

            const canalLogsPonto = interaction.guild.channels.cache.get(CANAIS.LOGS_PONTO);
            if (canalLogsPonto) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("▶️ Retorno de Pausa")
                    .setColor("#3498db")
                    .addFields(
                        { name: "Profissional", value: interaction.user.toString(), inline: true },
                        { name: "Duração da Pausa", value: `${minPausa}m`, inline: true }
                    )
                    .setTimestamp();
                canalLogsPonto.send({ embeds: [logEmbed] });
            }
            return;
        }

        if (customId === 'ponto_sair') {
            if (!pontosAtivos.has(interaction.user.id)) return interaction.reply({ content: "❌ Você não está em serviço.", ephemeral: true });
            const dados = pontosAtivos.get(interaction.user.id);

            // Se estiver pausado, finalizar a pausa
            if (dados.pausaAtual) {
                const duracaoPausa = Date.now() - dados.pausaAtual;
                dados.pausas.push({ inicio: dados.pausaAtual, fim: Date.now() });
                dados.totalPausado += duracaoPausa;
                dados.pausaAtual = null;
            }

            const tempoTotal = Date.now() - dados.entrada;
            const tempoTrabalhado = tempoTotal - dados.totalPausado;
            const minutosTrabalhados = Math.floor(tempoTrabalhado / 60000);
            const minutosPausas = Math.floor(dados.totalPausado / 60000);
            const minutosTotais = Math.floor(tempoTotal / 60000);

            const horasTrab = Math.floor(minutosTrabalhados / 60);
            const minsTrab = minutosTrabalhados % 60;
            const horasSaida = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const horasEntrada = new Date(dados.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            pontosAtivos.delete(interaction.user.id);

            // Acumular no ranking
            const dadosRank = rankingPonto.get(interaction.user.id) || { minutos: 0, nome: interaction.user.tag, turnos: 0 };
            dadosRank.minutos += minutosTrabalhados;
            dadosRank.nome = interaction.user.tag;
            dadosRank.turnos = (dadosRank.turnos || 0) + 1;
            rankingPonto.set(interaction.user.id, dadosRank);

            // Salvar no histórico
            const listaHistorico = historicoPonto.get(interaction.user.id) || [];
            listaHistorico.push({
                entrada: dados.entrada,
                saida: Date.now(),
                duracao: minutosTrabalhados,
                pausas: minutosPausas,
                numPausas: dados.pausas.length,
                data: Date.now()
            });
            historicoPonto.set(interaction.user.id, listaHistorico);

            await interaction.reply({
                content: `🔴 **Turno Encerrado às ${horasSaida}!**\n━━━━━━━━━━━━━━━━━━━━━━\n🟢 Entrada: **${horasEntrada}**\n🔴 Saída: **${horasSaida}**\n⏱️ Tempo trabalhado: **${horasTrab}h ${minsTrab}m**\n⏸️ Pausas: **${minutosPausas}m** (${dados.pausas.length} pausa${dados.pausas.length !== 1 ? 's' : ''})`,
                ephemeral: true
            });

            const canalLogsPonto = interaction.guild.channels.cache.get(CANAIS.LOGS_PONTO);
            if (canalLogsPonto) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("🔴 Saída de Serviço")
                    .setColor("#e74c3c")
                    .addFields(
                        { name: "Profissional", value: interaction.user.toString(), inline: true },
                        { name: "Entrada", value: horasEntrada, inline: true },
                        { name: "Saída", value: horasSaida, inline: true },
                        { name: "Tempo Trabalhado", value: `${horasTrab}h ${minsTrab}m`, inline: true },
                        { name: "Pausas", value: `${minutosPausas}m (${dados.pausas.length}x)`, inline: true },
                        { name: "Total Acumulado", value: `${Math.floor(dadosRank.minutos / 60)}h ${dadosRank.minutos % 60}m`, inline: true }
                    )
                    .setTimestamp();
                canalLogsPonto.send({ embeds: [logEmbed] });
            }
            return;
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_set_')) {
            const cargoEscolhido = interaction.customId.replace('modal_set_', '');
            const nome = interaction.fields.getTextInputValue('set_nome');
            const idPassaporte = interaction.fields.getTextInputValue('set_id');
            const telefone = interaction.fields.getTextInputValue('set_telefone');

            const mapaCargoId = {
                'paciente': CARGOS.PACIENTE,
                'juridico': CARGOS.JURIDICO,
                'policia': CARGOS.POLICIA
            };
            const mapaCargoNome = {
                'paciente': '🏥 Paciente',
                'juridico': '⚖️ Jurídico',
                'policia': '🚔 Polícia'
            };

            const cargoId = mapaCargoId[cargoEscolhido];
            const cargoNome = mapaCargoNome[cargoEscolhido];

            if (cargoEscolhido === 'paciente') {
                const tagCargo = PREFIXOS[cargoId] || "";
                await interaction.member.roles.add(cargoId).catch(() => {});
                await interaction.member.setNickname(`${tagCargo} ${nome} | ${idPassaporte}`).catch(() => {});

                return interaction.reply({
                    content: `✅ **Registro aprovado automaticamente!**\nVocê foi registrado como **${cargoNome}**.\nApelido: **${tagCargo} ${nome} | ${idPassaporte}**`,
                    ephemeral: true
                });
            }

            fichasPendentes.set(interaction.user.id, { nome, id: idPassaporte, telefone, cargoId, cargoNome });

            await interaction.reply({ content: "✅ **Ficha Enviada!** Seus dados foram encaminhados para análise. Aguarde a aprovação.", ephemeral: true });

            const salaDiretoria = interaction.guild.channels.cache.get(CANAIS.DIRETORIA_FICHAS);
            if (salaDiretoria) {
                const embedFicha = new EmbedBuilder()
                    .setTitle("📋 Nova Solicitação de Registro")
                    .setColor(cargoEscolhido === 'juridico' ? "#f1c40f" : "#3498db")
                    .addFields(
                        { name: "👤 Usuário Discord", value: interaction.user.toString(), inline: true },
                        { name: "📋 Cargo Solicitado", value: cargoNome, inline: true },
                        { name: "\u200B", value: "\u200B", inline: false },
                        { name: "📝 Nome", value: nome, inline: true },
                        { name: "🆔 ID / Passaporte", value: idPassaporte, inline: true },
                        { name: "📞 Telefone", value: telefone, inline: true }
                    )
                    .setTimestamp();

                const botoesDiretoria = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`set_aprovar_${interaction.user.id}`).setLabel('🟢 Aprovar').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`set_rejeitar_${interaction.user.id}`).setLabel('🔴 Rejeitar').setStyle(ButtonStyle.Danger)
                );

                salaDiretoria.send({ embeds: [embedFicha], components: [botoesDiretoria] });
            }
            return;
        }

        if (interaction.customId === 'modal_ficha_entrada') {
            const nomeRp = interaction.fields.getTextInputValue('txt_nome');
            const idRp = interaction.fields.getTextInputValue('txt_id');
            const cargoSolicitado = interaction.fields.getTextInputValue('txt_cargo');

            fichasPendentes.set(interaction.user.id, { nomeRp, idRp, cargoSolicitado });

            await interaction.reply({ content: "✅ **Ficha Enviada!** Seus dados foram encaminhados para a análise da Diretoria de RH.", ephemeral: true });

            const salaDiretoria = interaction.guild.channels.cache.get(CANAIS.DIRETORIA_FICHAS);
            if (salaDiretoria) {
                const embedFicha = new EmbedBuilder()
                    .setTitle("📝 Nova Solicitação de Ficha / Entrada")
                    .setColor("#ffffff")
                    .addFields(
                        { name: "Usuário Discord", value: interaction.user.toString(), inline: true },
                        { name: "Nome Clínico (RP)", value: nomeRp, inline: true },
                        { name: "ID / Passaporte", value: idRp, inline: true },
                        { name: "Função Desejada", value: cargoSolicitado, inline: false }
                    ).setTimestamp();

                const botoesDiretoria = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`rh_aprovar_${interaction.user.id}`).setLabel('🟢 Aprovar').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`rh_rejeitar_${interaction.user.id}`).setLabel('🔴 Rejeitar').setStyle(ButtonStyle.Danger)
                );

                salaDiretoria.send({ embeds: [embedFicha], components: [botoesDiretoria] });
            }
        }
    }

    } catch (erro) {
        console.error('Erro ao processar interação:', erro);
        try {
            if (interaction.deferred) {
                await interaction.editReply({ content: '❌ Ocorreu um erro interno. Tente novamente.' }).catch(() => {});
            } else if (!interaction.replied) {
                await interaction.reply({ content: '❌ Ocorreu um erro interno. Tente novamente.', ephemeral: true }).catch(() => {});
            }
        } catch (e) {}
    }
});

process.on('unhandledRejection', error => {
    console.error('Erro assíncrono não tratado:', error);
});

process.on('uncaughtException', error => {
    console.error('Erro inesperado:', error);
});

client.login(token).catch(error => {
    console.error('ERRO: Falha ao conectar o bot ao Discord. Verifique se o token está correto.', error);
    process.exit(1);
});
