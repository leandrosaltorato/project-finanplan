import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/usuario.dart';
import 'api_service.dart';

class AuthService {
  final api = ApiService();

  Future<Usuario?> usuario() async {
    final prefs = await SharedPreferences.getInstance();
    final dados = prefs.getString('usuario');
    if (dados == null) return null;
    return Usuario.fromJson(jsonDecode(dados));
  }

  Future<int?> controleId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('controleId');
  }

  Future<void> salvar(Usuario usuario, int controleId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('usuario', jsonEncode(usuario.toJson()));
    await prefs.setInt('controleId', controleId);
  }

  Future<void> login(String email, String senha) async {
    final dados = await api.post('/usuarios/login', {
      'email': email,
      'senha': senha,
    });
    final usuario = Usuario.fromJson(Map<String, dynamic>.from(dados['usuario']));
    final controle = int.tryParse('${dados['controleId']}');
    if (controle == null) throw const ApiException('Controle financeiro não encontrado.');
    await salvar(usuario, controle);
  }

  Future<void> cadastrar(String nome, String email, String senha, String telefone) async {
    final dados = await api.post('/usuarios/cadastrar', {
      'nome': nome,
      'email': email,
      'senha': senha,
      'Telefone': telefone.isEmpty ? null : telefone,
    });
    final usuario = Usuario.fromJson(Map<String, dynamic>.from(dados));
    final controle = int.tryParse('${dados['controleId']}');
    if (controle == null) throw const ApiException('Controle financeiro não encontrado.');
    await salvar(usuario, controle);
  }

  Future<Usuario> perfil() async {
    final usuarioAtual = await usuario();
    if (usuarioAtual == null) throw const ApiException('Faça login novamente.');
    final dados = await api.get('/usuarios/buscar/${usuarioAtual.id}');
    return Usuario.fromJson(Map<String, dynamic>.from(dados));
  }

  Future<void> atualizarPerfil(String nome, String email, String telefone) async {
    final usuarioAtual = await usuario();
    final controle = await controleId();
    if (usuarioAtual == null || controle == null) throw const ApiException('Faça login novamente.');
    final dados = await api.put('/usuarios/atualizar/${usuarioAtual.id}', {
      'nome': nome,
      'email': email,
      'Telefone': telefone.isEmpty ? null : telefone,
    });
    await salvar(Usuario.fromJson(Map<String, dynamic>.from(dados)), controle);
  }

  Future<void> excluirConta() async {
    final usuarioAtual = await usuario();
    if (usuarioAtual == null) return;
    await api.delete('/usuarios/excluir/${usuarioAtual.id}');
    await sair();
  }

  Future<void> sair() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
