/**
 * PALDIO — SECRETÁRIA ELECTRÓNICA
 * Chat Widget para Website
 *
 * Comunicação:
 * Website → n8n Webhook → Ana (AI Agent) → Website
 */

(function () {
    "use strict";

    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const N8N_WEBHOOK_URL =
        "COLOQUE_AQUI_A_URL_DO_WEBHOOK_N8N";


    /* =========================================================
       ESTADO DA CONVERSA
       ========================================================= */

    let sessionId = localStorage.getItem("paldio_chat_session");

    if (!sessionId) {
        sessionId =
            "paldio-" +
            Date.now() +
            "-" +
            Math.random().toString(36).substring(2, 10);

        localStorage.setItem(
            "paldio_chat_session",
            sessionId
        );
    }


    /* =========================================================
       CSS
       ========================================================= */

    const style = document.createElement("style");

    style.textContent = `
        #paldio-chat-button {
            position: fixed;
            right: 24px;
            bottom: 24px;
            width: 62px;
            height: 62px;
            border-radius: 50%;
            border: none;
            background: #198754;
            color: #ffffff;
            cursor: pointer;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 27px;
            box-shadow: 0 8px 25px rgba(0,0,0,.20);
            transition: .25s ease;
        }

        #paldio-chat-button:hover {
            transform: scale(1.06);
        }

        #paldio-chat-window {
            position: fixed;
            right: 24px;
            bottom: 100px;
            width: 370px;
            height: 570px;
            background: #ffffff;
            border-radius: 18px;
            overflow: hidden;
            z-index: 999998;
            display: none;
            flex-direction: column;
            box-shadow: 0 15px 50px rgba(0,0,0,.25);
            border: 1px solid #e8e8e8;
            font-family: Arial, Helvetica, sans-serif;
        }

        #paldio-chat-header {
            background: #198754;
            color: #ffffff;
            padding: 17px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        #paldio-chat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        #paldio-chat-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: #ffffff;
            color: #198754;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
        }

        #paldio-chat-name {
            font-weight: bold;
            font-size: 15px;
        }

        #paldio-chat-status {
            font-size: 12px;
            opacity: .9;
            margin-top: 3px;
        }

        #paldio-chat-close {
            border: none;
            background: transparent;
            color: #ffffff;
            font-size: 25px;
            cursor: pointer;
            line-height: 1;
        }

        #paldio-chat-messages {
            flex: 1;
            padding: 18px;
            overflow-y: auto;
            background: #f5f7f8;
        }

        .paldio-message {
            display: flex;
            margin-bottom: 12px;
        }

        .paldio-message.user {
            justify-content: flex-end;
        }

        .paldio-message.assistant {
            justify-content: flex-start;
        }

        .paldio-message-bubble {
            max-width: 82%;
            padding: 11px 14px;
            border-radius: 15px;
            font-size: 14px;
            line-height: 1.45;
            word-wrap: break-word;
        }

        .paldio-message.assistant
        .paldio-message-bubble {
            background: #ffffff;
            color: #222222;
            border-bottom-left-radius: 4px;
        }

        .paldio-message.user
        .paldio-message-bubble {
            background: #198754;
            color: #ffffff;
            border-bottom-right-radius: 4px;
        }

        #paldio-quick-options {
            padding: 10px 14px;
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            background: #ffffff;
            border-top: 1px solid #eeeeee;
        }

        .paldio-option {
            border: 1px solid #198754;
            background: #ffffff;
            color: #198754;
            border-radius: 20px;
            padding: 7px 10px;
            cursor: pointer;
            font-size: 12px;
        }

        .paldio-option:hover {
            background: #198754;
            color: #ffffff;
        }

        #paldio-chat-input-area {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px;
            background: #ffffff;
            border-top: 1px solid #eeeeee;
        }

        #paldio-chat-input {
            flex: 1;
            border: 1px solid #dddddd;
            border-radius: 22px;
            padding: 11px 14px;
            outline: none;
            font-size: 14px;
        }

        #paldio-chat-input:focus {
            border-color: #198754;
        }

        #paldio-chat-send {
            width: 42px;
            height: 42px;
            border: none;
            border-radius: 50%;
            background: #198754;
            color: #ffffff;
            cursor: pointer;
            font-size: 17px;
        }

        #paldio-chat-send:disabled {
            opacity: .5;
            cursor: not-allowed;
        }

        .paldio-typing {
            display: flex;
            gap: 4px;
            padding: 4px 0;
        }

        .paldio-typing span {
            width: 6px;
            height: 6px;
            background: #999999;
            border-radius: 50%;
            animation: paldioTyping 1.2s infinite;
        }

        .paldio-typing span:nth-child(2) {
            animation-delay: .15s;
        }

        .paldio-typing span:nth-child(3) {
            animation-delay: .30s;
        }

        @keyframes paldioTyping {
            0%, 60%, 100% {
                transform: translateY(0);
            }

            30% {
                transform: translateY(-5px);
            }
        }

        @media (max-width: 600px) {

            #paldio-chat-window {
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                border-radius: 0;
            }

            #paldio-chat-button {
                right: 18px;
                bottom: 18px;
            }
        }
    `;

    document.head.appendChild(style);


    /* =========================================================
       BOTÃO FLUTUANTE
       ========================================================= */

    const chatButton = document.createElement("button");

    chatButton.id = "paldio-chat-button";
    chatButton.setAttribute(
        "aria-label",
        "Falar com a Paldio"
    );

    chatButton.innerHTML = "💬";

    document.body.appendChild(chatButton);


    /* =========================================================
       JANELA DO CHAT
       ========================================================= */

    const chatWindow = document.createElement("div");

    chatWindow.id = "paldio-chat-window";

    chatWindow.innerHTML = `

        <div id="paldio-chat-header">

            <div id="paldio-chat-header-info">

                <div id="paldio-chat-avatar">
                    A
                </div>

                <div>

                    <div id="paldio-chat-name">
                        Ana — Paldio
                    </div>

                    <div id="paldio-chat-status">
                        Assistente virtual
                    </div>

                </div>

            </div>

            <button
                id="paldio-chat-close"
                aria-label="Fechar atendimento"
            >
                ×
            </button>

        </div>


        <div id="paldio-chat-messages"></div>


        <div id="paldio-quick-options">

            <button
                class="paldio-option"
                data-message="Quero informações sobre os serviços de consultoria ambiental."
            >
                Consultoria Ambiental
            </button>

            <button
                class="paldio-option"
                data-message="Preciso de informações sobre licenciamento ambiental."
            >
                Licenciamento
            </button>

            <button
                class="paldio-option"
                data-message="Preciso de informações sobre gestão de resíduos."
            >
                Gestão de Resíduos
            </button>

            <button
                class="paldio-option"
                data-message="Quero solicitar um orçamento."
            >
                Solicitar orçamento
            </button>

        </div>


        <div id="paldio-chat-input-area">

            <input
                id="paldio-chat-input"
                type="text"
                placeholder="Escreva a sua mensagem..."
                autocomplete="off"
            />

            <button
                id="paldio-chat-send"
                aria-label="Enviar mensagem"
            >
                ➤
            </button>

        </div>
    `;

    document.body.appendChild(chatWindow);


    /* =========================================================
       ELEMENTOS
       ========================================================= */

    const messagesContainer =
        document.getElementById(
            "paldio-chat-messages"
        );

    const input =
        document.getElementById(
            "paldio-chat-input"
        );

    const sendButton =
        document.getElementById(
            "paldio-chat-send"
        );

    const closeButton =
        document.getElementById(
            "paldio-chat-close"
        );


    /* =========================================================
       ABRIR / FECHAR
       ========================================================= */

    chatButton.addEventListener(
        "click",
        function () {

            const isOpen =
                chatWindow.style.display === "flex";

            if (isOpen) {

                chatWindow.style.display = "none";

            } else {

                chatWindow.style.display = "flex";

                input.focus();

                if (
                    messagesContainer.children.length === 0
                ) {
                    addMessage(
                        "Olá! Sou a Ana, assistente virtual da Paldio. Como posso ajudá-lo?",
                        "assistant"
                    );
                }
            }
        }
    );


    closeButton.addEventListener(
        "click",
        function () {

            chatWindow.style.display = "none";

        }
    );


    /* =========================================================
       ADICIONAR MENSAGEM
       ========================================================= */

    function addMessage(
        message,
        sender
    ) {

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "paldio-message " + sender;

        const bubble =
            document.createElement("div");

        bubble.className =
            "paldio-message-bubble";

        bubble.textContent = message;

        messageElement.appendChild(bubble);

        messagesContainer.appendChild(
            messageElement
        );

        scrollToBottom();
    }


    /* =========================================================
       INDICADOR DE DIGITAÇÃO
       ========================================================= */

    function showTyping() {

        const typing =
            document.createElement("div");

        typing.id =
            "paldio-typing-indicator";

        typing.className =
            "paldio-message assistant";

        typing.innerHTML = `
            <div class="paldio-message-bubble">
                <div class="paldio-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(
            typing
        );

        scrollToBottom();
    }


    function hideTyping() {

        const typing =
            document.getElementById(
                "paldio-typing-indicator"
            );

        if (typing) {
            typing.remove();
        }
    }


    /* =========================================================
       SCROLL
       ========================================================= */

    function scrollToBottom() {

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    }


    /* =========================================================
       ENVIAR PARA O N8N
       ========================================================= */

    async function sendMessage(
        message
    ) {

        message =
            String(message || "").trim();

        if (!message) {
            return;
        }

        if (
            !N8N_WEBHOOK_URL ||
            N8N_WEBHOOK_URL.includes(
                "COLOQUE_AQUI"
            )
        ) {

            addMessage(
                "O atendimento ainda não está configurado. Por favor, contacte a Paldio através dos nossos canais de atendimento.",
                "assistant"
            );

            console.error(
                "Configure a N8N_WEBHOOK_URL no paldio-chat-widget.js"
            );

            return;
        }


        addMessage(
            message,
            "user"
        );


        input.value = "";

        sendButton.disabled = true;

        showTyping();


        try {

            const response =
                await fetch(
                    N8N_WEBHOOK_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            chatInput: message,

                            sessionId:
                                sessionId,

                            channel:
                                "website",

                            source:
                                window.location.href,

                            timestamp:
                                new Date().toISOString()

                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Erro HTTP " +
                    response.status
                );

            }


            const data =
                await response.json();


            hideTyping();


            /*
             * Aceita diferentes formatos
             * de resposta do n8n.
             */

            const answer =
                data.output ||
                data.response ||
                data.message ||
                data.text ||
                data.reply;


            if (answer) {

                addMessage(
                    answer,
                    "assistant"
                );

            } else {

                addMessage(
                    "Recebi a sua mensagem, mas não consegui obter uma resposta neste momento. Por favor, tente novamente.",
                    "assistant"
                );

                console.warn(
                    "Resposta recebida do n8n:",
                    data
                );
            }


        } catch (error) {

            console.error(
                "Erro ao contactar o n8n:",
                error
            );

            hideTyping();

            addMessage(
                "Não foi possível estabelecer ligação com o nosso atendimento neste momento. Por favor, tente novamente.",
                "assistant"
            );

        } finally {

            sendButton.disabled = false;

            input.focus();

        }
    }


    /* =========================================================
       BOTÃO ENVIAR
       ========================================================= */

    sendButton.addEventListener(
        "click",
        function () {

            sendMessage(
                input.value
            );

        }
    );


    /* =========================================================
       ENTER PARA ENVIAR
       ========================================================= */

    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage(
                    input.value
                );

            }

        }
    );


    /* =========================================================
       OPÇÕES RÁPIDAS
       ========================================================= */

    document
        .querySelectorAll(
            ".paldio-option"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const message =
                            button.dataset.message;

                        sendMessage(
                            message
                        );

                    }
                );

            }
        );


})();