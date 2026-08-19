function extrairTotal(texto) {
    const textoNormalizado = texto
        .replace(/\r/g, "")
        .replace(/,/g, ".");

    const regex = /TOTAL\s*R?\$?\s*\n?\s*(\d+\.\d{2})/i;

    const resultado = textoNormalizado.match(regex);

    if (!resultado) {
        return null;
    }

    return parseFloat(resultado[1]);
}

module.exports = {
    extrairTotal
};