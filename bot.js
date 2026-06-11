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
    COORDENADOR_PSICOLOGIA: "1514341841439555674"
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

const pontosAtivos = new Map(); 
const fichasPendentes = new Map(); 
const advertenciasBanco = new Map(); 

// ==========================================
// 4. REGISTRO DE COMANDOS SLASH (/)
// ==========================================
const comandos = [
    {
        name: 'hierarquiapsicologia',
        description: 'Atualiza o quadro de hierarquia da Psicologia',
        options: [
            { name: 'canal', type: 7, description: 'Canal onde a hierarquia da Psicologia sera enviada', required: false }
        ]
    },
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
    { name: 'painel_ponto', description: '⏱️ Envia o painel de registro de ponto eletrônico' },
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
    { name: 'embed', description: '📢 Envia uma mensagem personalizada (Embed)', options: [{ name: 'titulo', type: 3, description: 'Título', required: true }, { name: 'descricao', type: 3, description: 'Texto', required: true }, { name: 'cor', type: 3, description: 'Cor em HEX', required: false }] }
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
            await atualizarQuadroFuncionarios(guild);
            await atualizarQuadroPsicologia(guild);
        } catch (err) {
            console.error("Erro na atualizacao inicial de quadros:", err);
        }
    }

    setInterval(() => {
        client.guilds.cache.forEach(async (guild) => {
            try {
                await atualizarQuadroFuncionarios(guild);
                await atualizarQuadroPsicologia(guild);
            } catch (err) {
                console.error("Erro na varredura automática de quadros:", err);
            }
        });
    }, 60000);
});

// ==========================================
// 6A. FUNÇÃO: ATUALIZAR QUADRO FUNCIONÁRIOS
// ==========================================
async function buscarCanalTexto(guild, canalId, nomeCanal) {
    const canal = guild.channels.cache.get(canalId) || await guild.channels.fetch(canalId).catch(() => null);

    if (!canal) {
        console.error(`Canal ${nomeCanal} nao encontrado. Confira o ID configurado: ${canalId}`);
        return null;
    }

    if (typeof canal.isTextBased === 'function' && !canal.isTextBased()) {
        console.error(`Canal ${nomeCanal} nao e um canal de texto: ${canalId}`);
        return null;
    }

    return canal;
}

async function atualizarQuadroFuncionarios(guild) {
    const canalQuadro = await buscarCanalTexto(guild, CANAIS.HIERARQUIA, 'HIERARQUIA');
    if (!canalQuadro) return;

    await guild.members.fetch(); 

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
    if (typeof canalPsi.isTextBased === 'function' && !canalPsi.isTextBased()) {
        throw new Error('O canal da hierarquia da Psicologia precisa ser um canal de texto.');
    }

    await guild.members.fetch(); 

    const embed = new EmbedBuilder()
        .setTitle("🧠 QUADRO DE HIERARQUIA — DEPARTAMENTO DE PSICOLOGIA")
        .setDescription("Listagem oficializada, dinâmica e em tempo real de todo o corpo e sub-equipes de Psicologia Clínica.")
        .setColor("#9b59b6")
        .setTimestamp();

    const cargosPsicologia = [
        { id: CARGOS.CHEFE_PSICOLOGIA, label: "👑 Chefe de Psicologia" },
        { id: CARGOS.COORDENADOR_PSICOLOGIA, label: "📋 Coordenador(a) da Psicologia" },
        { id: CARGOS.SUPERVISOR_PSICOLOGIA, label: "📈 Supervisor(a) da Psicologia" },
        { id: CARGOS.PSICOLOGO, label: "🧠 Psicólogo(a)" },
        { id: CARGOS.AUXILIAR_PSICOLOGIA, label: "📝 Auxiliar da Psicologia" }
    ];

    let totalPsicologia = 0;

    for (const itemCargo of cargosPsicologia) {
        const cargoObj = guild.roles.cache.get(itemCargo.id);
        if (!cargoObj) {
            console.error(`Cargo da hierarquia de psicologia nao encontrado: ${itemCargo.label} (${itemCargo.id})`);
            continue;
        }

        const membrosFiltrados = guild.members.cache.filter(m => m.roles.cache.has(itemCargo.id)).map(m => `↳ ${m.toString()}`);
        const totalNoCargo = membrosFiltrados.length;
        totalPsicologia += totalNoCargo;

        let conteudoDaCategoria = "";
        if (totalNoCargo > 0) {
            conteudoDaCategoria += membrosFiltrados.join('\n') + '\n\n';
        } else {
            conteudoDaCategoria += `↳ Cargo Vago\n\n`;
        }

        embed.addFields({ name: `${cargoObj.toString()} [${totalNoCargo}]`, value: conteudoDaCategoria, inline: false });
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
            await atualizarQuadroFuncionarios(interaction.guild);
            await atualizarQuadroPsicologia(interaction.guild);
            return interaction.editReply({ content: "✅ Sincronização e atualização de todos os quadros forçada com sucesso!" });
        }

        if (commandName === 'hierarquiapsicologia') {
            if (!interaction.member.roles.cache.has(ID_DIRETOR_GERAL) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "Apenas a Direcao Geral ou Administradores podem atualizar a hierarquia da Psicologia.", ephemeral: true });
            }

            await interaction.deferReply({ ephemeral: true });
            const canalEscolhido = options.getChannel('canal') || interaction.channel;
            try {
                await atualizarQuadroPsicologia(interaction.guild, canalEscolhido);
                return interaction.editReply({ content: `Hierarquia da Psicologia atualizada em ${canalEscolhido.toString()}.` });
            } catch (error) {
                console.error('Erro ao atualizar hierarquia da Psicologia:', error);
                return interaction.editReply({ content: `Nao consegui enviar a hierarquia em ${canalEscolhido.toString()}. Verifique se e um canal de texto e se o bot tem permissao para ver, enviar e editar mensagens.` });
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
                .setTitle("Central de Recepção & Triagem")
                .setDescription("Seja muito bem-vindo à nossa unidade! Para dar início aos seus atendimentos ou registrar a sua entrada na equipe profissional, clique abaixo para preencher sua ficha.")
                .setColor("#0099ff");

            const botao = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_abrir_ficha').setLabel('📝 Solicitar Registro / Ficha').setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({ content: "✅ Painel de entrada enviado.", ephemeral: true });
            return interaction.channel.send({ embeds: [embed], components: [botao] });
        }

        if (commandName === 'painel_ponto') {
            const embed = new EmbedBuilder()
                .setTitle("⏱️ Registro Eletrônico de Ponto")
                .setDescription("Funcionário, utilize este terminal digital para computar o início e o encerramento do seu turno.")
                .setColor("#ffff00");

            const botoes = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ponto_entrar').setLabel('🟢 Entrar em Serviço').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ponto_sair').setLabel('🔴 Sair de Serviço').setStyle(ButtonStyle.Danger)
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
    }

    if (interaction.isStringSelectMenu()) {
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
            if (pontosAtivos.has(interaction.user.id)) return interaction.reply({ content: "❌ Você já possui um turno de serviço ativo.", ephemeral: true });
            pontosAtivos.set(interaction.user.id, Date.now());
            return interaction.reply({ content: "🟢 **Turno Iniciado!** Tenha um excelente plantão.", ephemeral: true });
        }

        if (customId === 'ponto_sair') {
            if (!pontosAtivos.has(interaction.user.id)) return interaction.reply({ content: "❌ Você não iniciou um plantão neste terminal.", ephemeral: true });

            const tempoEntrada = pontosAtivos.get(interaction.user.id);
            const diffMilissegundos = Date.now() - tempoEntrada;
            const minutosTotais = Math.floor(diffMilissegundos / 60000);
            const horas = Math.floor(minutosTotais / 60);
            const minutes = minutosTotais % 60;

            pontosAtivos.delete(interaction.user.id);
            await interaction.reply({ content: `🔴 **Turno Encerrado!** Duração total computada: **${horas}h ${minutes}m**.`, ephemeral: true });

            const canalLogsPonto = interaction.guild.channels.cache.get(CANAIS.LOGS_PONTO);
            if (canalLogsPonto) {
                const logEmbed = new EmbedBuilder()
                    .setTitle("⏱️ Registro de Plantão Encerrado")
                    .addFields({ name: "Profissional", value: interaction.user.toString(), inline: true }, { name: "Duração Registrada", value: `${horas}h ${minutes}m`, inline: true })
                    .setColor("#ff9900").setTimestamp();
                canalLogsPonto.send({ embeds: [logEmbed] });
            }
            return;
        }
    }

    if (interaction.isModalSubmit()) {
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
