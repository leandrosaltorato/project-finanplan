import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'shell_page.dart';

class CadastroPage extends StatefulWidget {
  const CadastroPage({super.key});
  @override
  State<CadastroPage> createState() => _CadastroPageState();
}

class _CadastroPageState extends State<CadastroPage> {
  final nome = TextEditingController();
  final email = TextEditingController();
  final telefone = TextEditingController();
  final senha = TextEditingController();
  final confirmar = TextEditingController();
  final auth = AuthService();
  bool carregando = false;
  bool mostrarSenha = false;

  @override
  void dispose() {
    nome.dispose();
    email.dispose();
    telefone.dispose();
    senha.dispose();
    confirmar.dispose();
    super.dispose();
  }

  Future<void> cadastrar() async {
    if (nome.text.trim().isEmpty || email.text.trim().isEmpty || senha.text.isEmpty) {
      mensagem('Preencha os campos obrigatórios.');
      return;
    }
    if (senha.text != confirmar.text) {
      mensagem('As senhas não coincidem.');
      return;
    }
    setState(() => carregando = true);
    try {
      await auth.cadastrar(nome.text.trim(), email.text.trim(), senha.text, telefone.text.trim());
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const ShellPage()), (_) => false);
    } on ApiException catch (e) {
      mensagem(e.mensagem);
    } finally {
      if (mounted) setState(() => carregando = false);
    }
  }

  void mensagem(String texto) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Criar conta')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 450),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('FinanPlan', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppTheme.text)),
                    const SizedBox(height: 4),
                    const Text('Crie sua conta', style: TextStyle(color: AppTheme.cinza)),
                    const SizedBox(height: 20),
                    TextField(controller: nome, decoration: const InputDecoration(labelText: 'Nome completo')),
                    const SizedBox(height: 12),
                    TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'E-mail')),
                    const SizedBox(height: 12),
                    TextField(controller: telefone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Telefone')),
                    const SizedBox(height: 12),
                    TextField(controller: senha, obscureText: !mostrarSenha, decoration: InputDecoration(labelText: 'Senha', suffixIcon: IconButton(onPressed: () => setState(() => mostrarSenha = !mostrarSenha), icon: Icon(mostrarSenha ? Icons.visibility_off : Icons.visibility)))),
                    const SizedBox(height: 12),
                    TextField(controller: confirmar, obscureText: !mostrarSenha, decoration: const InputDecoration(labelText: 'Confirmar senha')),
                    const SizedBox(height: 20),
                    FilledButton(onPressed: carregando ? null : cadastrar, child: carregando ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Criar conta')),
                    TextButton(onPressed: carregando ? null : () => Navigator.pop(context), child: const Text('Voltar para o login')),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
