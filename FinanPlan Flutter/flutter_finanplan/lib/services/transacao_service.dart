import '../models/categoria.dart';
import '../models/transacao.dart';
import 'api_service.dart';

class TransacaoService {
  final api = ApiService();

  Future<List<Categoria>> categorias() async {
    final dados = await api.get('/categoria/listar');
    if (dados is! List) return [];
    return dados.map((e) => Categoria.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<List<Transacao>> listar(int controleId) async {
    final dados = await api.get('/transacoes/listar');
    if (dados is! List) return [];
    return dados
        .map((e) => Transacao.fromJson(Map<String, dynamic>.from(e)))
        .where((e) => e.controleId == controleId)
        .toList();
  }

  Future<void> cadastrar(String descricao, double valor, String tipo, int categoriaId, int controleId) async {
    await api.post('/transacoes/cadastrar', {
      'descricao': descricao,
      'valor': valor,
      'tipo': tipo,
      'categoriaId': categoriaId,
      'controleId': controleId,
    });
  }

  Future<void> atualizar(int id, String descricao, double valor, String tipo, int categoriaId, int controleId) async {
    await api.put('/transacoes/atualizar/$id', {
      'descricao': descricao,
      'valor': valor,
      'tipo': tipo,
      'categoriaId': categoriaId,
      'controleId': controleId,
    });
  }

  Future<void> excluir(int id) async {
    await api.delete('/transacoes/excluir/$id');
  }
}
