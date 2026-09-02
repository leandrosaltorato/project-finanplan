function extrairTotal(texto) {
  if (!texto) {
    return null;
  }

  const textoNormalizado = texto
    .replace(/\r/g, "")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ");

  const regexTotal =
    /TOTAL\s*(?:R?\$)?\s*:?\s*(\d+\.\d{2})/i;

  const resultadoTotal = textoNormalizado.match(regexTotal);

  if (resultadoTotal) {
    return parseFloat(resultadoTotal[1]);
  }

  const regexValorTotal =
    /VALOR\s+TOTAL\s*(?:R?\$)?\s*:?\s*(\d+\.\d{2})/i;

  const resultadoValorTotal =
    textoNormalizado.match(regexValorTotal);

  if (resultadoValorTotal) {
    return parseFloat(resultadoValorTotal[1]);
  }

  const regexValorPago =
    /VALOR\s+PAGO\s*(?:R?\$)?\s*:?\s*(\d+\.\d{2})/i;

  const resultadoValorPago =
    textoNormalizado.match(regexValorPago);

  if (resultadoValorPago) {
    return parseFloat(resultadoValorPago[1]);
  }

  const regexPagamento =
    /(?:Credito|Cr[eé]dito|Debito|D[eé]bito|Dinheiro)\s*(\d+\.\d{2})/i;

  const resultadoPagamento =
    textoNormalizado.match(regexPagamento);

  if (resultadoPagamento) {
    return parseFloat(resultadoPagamento[1]);
  }

  return null;
}

module.exports = {
  extrairTotal,
};
