export const attachSocketClient = (content: string): string => {
    return content.replace(
        "</html>",
        `
<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();

socket.on("refresh", () => {
    location.reload();
});
</script>

</html>
    `.trim()
    );
};
