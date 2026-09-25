import 'categoria.dart';

class Transacao {
  final int id;
  final String descricao;
  final double valor;
  final String tipo;
  final int categoriaId;
  final int controleId;
  final DateTime? data;
  final Categoria? categoria;

  const Transacao({
    required this.id,
    required this.descricao,
    required this.valor,
    required this.tipo,
    required this.categoriaId,
    required this.controleId,
    required this.data,
    required this.categoria,
  });

  bool get entrada => tipo == 'ENTRADA';

  factory Transacao.fromJson(Map<String, dynamic> json) {
    return Transacao(
      id: int.tryParse('${json['id']}') ?? 0,
      descricao: '${json['descricao'] ?? ''}',
      valor: double.tryParse('${json['valor'] ?? 0}') ?? 0,
      tipo: '${json['tipo'] ?? 'SAIDA'}'.toUpperCase(),
      categoriaId: int.tryParse('${json['categoriaId'] ?? 0}') ?? 0,
      controleId: int.tryParse('${json['controleId'] ?? 0}') ?? 0,
      data: DateTime.tryParse('${json['data']}'),
      categoria: json['categoria'] is Map
          ? Categoria.fromJson(Map<String, dynamic>.from(json['categoria']))
          : null,
    );
  }
}
