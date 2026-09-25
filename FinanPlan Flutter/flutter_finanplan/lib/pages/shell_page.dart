import 'package:flutter/material.dart';
import '../models/usuario.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'configuracoes_page.dart';
import 'dashboard_page.dart';
import 'login_page.dart';
import 'metas_page.dart';
import 'perfil_page.dart';
import 'transacoes_page.dart';

class ShellPage extends StatefulWidget {
  const ShellPage({super.key});
  @override
  State<ShellPage> createState() => _ShellPageState();
}

class _ShellPageState extends State<ShellPage> {
  final auth = AuthService();
  Usuario? usuario;
  int pagina = 0;

  final paginas = const [
    DashboardPage(),
    TransacoesPage(),
    MetasPage(),
    PerfilPage(),
    ConfiguracoesPage(),
  ];

  @override
  void initState() {
    super.initState();
    carregarUsuario();
  }

  Future<void> carregarUsuario() async {
    final dados = await auth.usuario();
    if (mounted) setState(() => usuario = dados);
  }

  Future<void> sair() async {
    await auth.sair();
    if (!mounted) return;
    Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginPage()), (_) => false);
  }

  void selecionar(int valor) {
    setState(() => pagina = valor);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FinanPlan', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: [
          if (usuario != null) Center(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 12), child: Text(usuario!.nome))),
          IconButton(onPressed: sair, icon: const Icon(Icons.logout)),
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                color: AppTheme.azul,
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('FinanPlan', style: TextStyle(color: Colors.white, fontSize: 25, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text(usuario?.nome ?? 'Usuário', style: const TextStyle(color: Colors.white)),
                ]),
              ),
              _item(Icons.dashboard, 'Dashboard', 0),
              _item(Icons.sync_alt, 'Transações', 1),
              _item(Icons.my_location, 'Metas', 2),
              _item(Icons.person, 'Perfil', 3),
              _item(Icons.settings, 'Configurações', 4),
            ],
          ),
        ),
      ),
      body: IndexedStack(index: pagina, children: paginas),
      bottomNavigationBar: NavigationBar(
        selectedIndex: pagina,
        onDestinationSelected: (valor) => setState(() => pagina = valor),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.sync_alt), label: 'Transações'),
          NavigationDestination(icon: Icon(Icons.my_location), label: 'Metas'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Perfil'),
          NavigationDestination(icon: Icon(Icons.settings), label: 'Config.'),
        ],
      ),
    );
  }

  Widget _item(IconData icon, String titulo, int valor) {
    return ListTile(
      leading: Icon(icon),
      title: Text(titulo),
      selected: pagina == valor,
      onTap: () => selecionar(valor),
    );
  }
}
