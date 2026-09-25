class Categoria {
  final int id;
  final String nome;
  final String tipo;
  final String cor;

  const Categoria({
    required this.id,
    required this.nome,
    required this.tipo,
    required this.cor,
  });

  factory Categoria.fromJson(Map<String, dynamic> json) {
    return Categoria(
      id: int.tryParse('${json['id']}') ?? 0,
      nome: '${json['nome'] ?? json['tipo'] ?? 'Outros'}',
      tipo: '${json['tipo'] ?? 'OUTROS'}',
      cor: '${json['cor'] ?? '#6B7280'}',
    );
  }
}
