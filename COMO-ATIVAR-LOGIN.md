# Como ativar o login do Contas em Dia

Enquanto o login não estiver ativado, o app funciona como antes: sem login, com as contas guardadas só no celular.
Depois de ativado, cada pessoa entra com e-mail e senha (ou Google), as contas ficam na nuvem e **só entra quem você liberar**.

Leva uns 15 minutos. Dá para fazer pelo celular, mas é mais fácil num computador.

## 1. Criar o projeto no Firebase

1. Entre em <https://console.firebase.google.com> com a sua conta Google.
2. Toque em **Criar um projeto** (ou "Adicionar projeto"). Nome: `contas-em-dia`. Pode desativar o Google Analytics.
3. Espere terminar e toque em **Continuar**.

## 2. Ligar o login

1. No menu da esquerda: **Criação > Authentication > Vamos começar**.
2. Na aba **Método de login**, ative **E-mail/senha** (só a primeira chave) e salve.
3. Se quiser o botão "Entrar com Google", ative também **Google**, escolha seu e-mail de suporte e salve.
4. Na aba **Configurações > Domínios autorizados**, toque em **Adicionar domínio** e coloque o endereço onde o app fica publicado, sem `https://` (por exemplo `seunome.github.io` ou `contas-em-dia.netlify.app`).

## 3. Criar o banco de dados

1. No menu: **Criação > Firestore Database > Criar banco de dados**.
2. Local: `southamerica-east1 (São Paulo)`. Modo: **produção**. Toque em **Criar**.
3. Vá na aba **Regras**, apague tudo e cole o conteúdo do arquivo `firestore.rules` deste repositório.
4. Nas regras, troque `SEU_EMAIL@exemplo.com` pelo **seu e-mail** (o que você vai usar para entrar no app) e toque em **Publicar**.

## 4. Pegar a configuração do app

1. Toque na engrenagem ⚙️ ao lado de "Visão geral do projeto" > **Configurações do projeto**.
2. Em **Seus apps**, toque no ícone **`</>`** (Web). Apelido: `contas-em-dia`. Não precisa marcar Hosting. Toque em **Registrar app**.
3. Vai aparecer um bloco assim:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "contas-em-dia-xxxx.firebaseapp.com",
     projectId: "contas-em-dia-xxxx",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

   Copie só a parte entre as chaves `{ ... }`, incluindo as chaves.

## 5. Colocar no app

No `index.html`, procure estas duas linhas (use a busca por `FIREBASE_CONFIG`):

```js
const FIREBASE_CONFIG=null;
const ADMIN_EMAIL="";
```

E troque por (com os seus dados):

```js
const FIREBASE_CONFIG={apiKey:"AIza...",authDomain:"contas-em-dia-xxxx.firebaseapp.com",projectId:"contas-em-dia-xxxx",storageBucket:"...",messagingSenderId:"...",appId:"..."};
const ADMIN_EMAIL="seu@email.com";
```

O `ADMIN_EMAIL` tem que ser **o mesmo e-mail** que você colocou nas regras do passo 3.

Esses dados do Firebase não são senha: podem ficar no código. Quem protege as contas são as regras do passo 3.

## 6. Primeiro acesso

1. Publique o `index.html` atualizado e abra o app.
2. Toque em **Criar conta** com o **seu e-mail** (o do `ADMIN_EMAIL`), confirme o e-mail pelo link que chegar e entre.
   As contas que já estavam no seu celular sobem automaticamente para a sua conta.
3. Toque na sua bolinha no canto de cima > **Controle de acesso**. É ali que você libera, recusa ou bloqueia as pessoas.

## Como funciona o acesso

- Uma pessoa nova cria conta, confirma o e-mail e vê **"Aguardando liberação"**.
- O pedido aparece no seu **Controle de acesso**. Você toca em **Liberar** ou **Recusar**.
- Você também pode liberar alguém antes, digitando o e-mail em **"Liberar um e-mail direto"**.
- Para tirar o acesso de alguém, toque em **Bloquear**. A pessoa sai na próxima vez que o app tentar salvar ou quando abrir de novo.
- Cada pessoa só vê as próprias contas. Nem você vê as contas dos outros.
