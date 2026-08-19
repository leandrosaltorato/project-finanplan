const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const TESSERACT_PATH =
    "C:\\Program Files\\Tesseract-OCR\\tesseract.exe";

async function executarTesseract(caminhoImagem) {
    const { stdout } = await execFileAsync(
        TESSERACT_PATH,
        [ 
            caminhoImagem,
            "stdout",
            "-l",
            "por",
            "--psm",
            "11"
        ]
    );

    return stdout;
}

module.exports = {
    executarTesseract
};