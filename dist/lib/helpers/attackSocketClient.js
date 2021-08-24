"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attackSocketClient = void 0;
const attackSocketClient = (content) => {
    return content.replace("</html>", `
<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();

socket.on("refresh", () => {
    location.reload();
});
</script>

</html>
    `.trim());
};
exports.attackSocketClient = attackSocketClient;
