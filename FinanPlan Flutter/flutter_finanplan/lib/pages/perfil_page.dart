import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';

class PerfilPage extends StatefulWidget {
  const PerfilPage({super.key});
  @override
  State<PerfilPage> createState() => _PerfilPageState();
}

class _PerfilPageState extends State<PerfilPage> {
  final auth = AuthService();
  final nome = TextEditingController();
  final email = TextEditingController();
  final telefone = TextEditingController();
  bool carregando = true;
  bool salvando = false;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  @override
  void dispose() {
    nome.dispose();
    email.dispose();
    telefone.dispose();
    super.dispose();
  }

  Future<void> carregar() async {
    try {
      final usuario = await auth.perfil();
      nome.text = usuario.nome;
      email.text = usuario.email;
      telefone.text = usuario.telefone ?? '';
    } on ApiException catch (e) {
      mensagem(e.mensagem);
    } finally {
      if (mounted) setState(() => carregando = false);
    }
  }

  Future<void> salvar() async {
    if (nome.text.trim().isEmpty || email.text.trim().isEmpty) {
      mensagem('Preencha nome e e-mail.');
      return;
    }
    setState(() => salvando = true);
    try {
      await auth.atualizarPerfil(nome.text.trim(), email.text.trim(), telefone.text.trim());
      mensagem('Perfil atualizado.');
    } on ApiException catch (e) {
      mensagem(e.mensagem);
    } finally {
      if (mounted) setState(() => salvando = false);
    }
  }

  Future<void> excluir() async {
    final ok = await showDialog<bool>(context: context, builder: (context) => AlertDialog(title: const Text('Excluir conta'), content: const Text('Todos os dados desta conta serão excluídos.'), actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')), FilledButton(onPressed: () => Navigator.pop(context, true), style: FilledButton.styleFrom(backgroundColor: AppTheme.vermelho), child: const Text('Excluir'))]));
    if (ok != true) return;
    try {
      await auth.excluirConta();
      if (!mounted) return;
      Navigator.pop(context);
    } on ApiException catch (e) {
      mensagem(e.mensagem);
    }
  }

  void mensagem(String texto) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }

  @override
  Widget build(BuildContext context) {
    if (carregando) return const Center(child: CircularProgressIndicator());
    return ListView(padding: const EdgeInsets.all(18), children: [
      const Text('Perfil', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700)),
      const SizedBox(height: 4),
      const Text('Suas informações pessoais', style: TextStyle(color: AppTheme.cinza)),
      const SizedBox(height: 18),
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const CircleAvatar(radius: 35, backgroundColor: AppTheme.azul, child: Icon(Icons.person, color: Colors.white, size: 35)),
        const SizedBox(height: 18),
        TextField(controller: nome, decoration: const InputDecoration(labelText: 'Nome completo')),
        const SizedBox(height: 12),
        TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'E-mail')),
        const SizedBox(height: 12),
        TextField(controller: telefone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Telefone')),
        const SizedBox(height: 18),
        Align(alignment: Alignment.centerRight, child: FilledButton.icon(onPressed: salvando ? null : salvar, icon: const Icon(Icons.check), label: Text(salvando ? 'Salvando...' : 'Salvar alterações'))),
      ]))),
      const SizedBox(height: 18),
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Row(children: [const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Zona de Perigo', style: TextStyle(fontSize: 19, fontWeight: FontWeight.w700)), SizedBox(height: 4), Text('Excluir conta permanentemente', style: TextStyle(color: AppTheme.cinza))])), OutlinedButton.icon(onPressed: excluir, icon: const Icon(Icons.delete_forever, color: AppTheme.vermelho), label: const Text('Excluir conta'))]))),
    ]);
  }
}
