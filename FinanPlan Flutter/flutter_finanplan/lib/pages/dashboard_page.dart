import 'package:flutter/material.dart';
import '../models/categoria.dart';
import '../models/transacao.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/transacao_service.dart';
import '../theme/app_theme.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final auth = AuthService();
  final service = TransacaoService();
  List<Transacao> transacoes = [];
  List<Categoria> categorias = [];
  bool carregando = true;

  double get receitas => transacoes.where((e) => e.entrada).fold(0, (s, e) => s + e.valor);
  double get despesas => transacoes.where((e) => !e.entrada).fold(0, (s, e) => s + e.valor);
  double get saldo => receitas - despesas;

  @override
  void initState() {
    super.initState();
    carregar();
  }

  Future<void> carregar() async {
    try {
      final controle = await auth.controleId();
      if (controle == null) return;
      final lista = await service.listar(controle);
      final cats = await service.categorias();
      if (mounted) setState(() { transacoes = lista; categorias = cats; carregando = false; });
    } on ApiException catch (e) {
      if (mounted) { setState(() => carregando = false); mensagem(e.mensagem); }
    }
  }

  String moeda(double valor) => 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';

  Future<void> novaTransacao() async {
    String tipo = 'ENTRADA';
    Categoria? categoria;
    final descricao = TextEditingController();
    final valor = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModal) => AlertDialog(
          title: const Text('Nova transação'),
          content: SizedBox(
            width: 450,
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: descricao, decoration: const InputDecoration(labelText: 'Descrição')),
              const SizedBox(height: 12),
              TextField(controller: valor, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Valor')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(value: tipo, items: const [DropdownMenuItem(value: 'ENTRADA', child: Text('Entrada')), DropdownMenuItem(value: 'SAIDA', child: Text('Saída'))], onChanged: (v) => setModal(() => tipo = v!), decoration: const InputDecoration(labelText: 'Tipo')),
              const SizedBox(height: 12),
              DropdownButtonFormField<Categoria>(value: categoria, items: categorias.map((c) => DropdownMenuItem(value: c, child: Text(c.nome))).toList(), onChanged: (v) => setModal(() => categoria = v), decoration: const InputDecoration(labelText: 'Categoria')),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () async {
              final numero = double.tryParse(valor.text.trim().replaceAll(',', '.'));
              final controle = await auth.controleId();
              if (descricao.text.trim().isEmpty || numero == null || numero <= 0 || categoria == null || controle == null) {
                mensagem('Preencha os campos corretamente.');
                return;
              }
              try {
                await service.cadastrar(descricao.text.trim(), numero, tipo, categoria!.id, controle);
                if (context.mounted) Navigator.pop(context, true);
              } on ApiException catch (e) {
                mensagem(e.mensagem);
              }
            }, child: const Text('Cadastrar')),
          ],
        ),
      ),
    );

    descricao.dispose();
    valor.dispose();
    if (ok == true) carregar();
  }

  void mensagem(String texto) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: carregar,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(children: [const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Dashboard', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700)), SizedBox(height: 4), Text('Visão geral das suas finanças', style: TextStyle(color: AppTheme.cinza))])), FilledButton.icon(onPressed: novaTransacao, icon: const Icon(Icons.add), label: const Text('Nova'))]),
          const SizedBox(height: 18),
          Wrap(spacing: 14, runSpacing: 14, children: [
            _card('Saldo Total', moeda(saldo), Icons.account_balance_wallet),
            _card('Receitas', moeda(receitas), Icons.arrow_upward),
            _card('Despesas', moeda(despesas), Icons.arrow_downward),
            _card('Meta de Economia', moeda(saldo * .3), Icons.savings),
          ]),
          const SizedBox(height: 18),
          Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Transações Recentes', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            if (carregando) const Center(child: Padding(padding: EdgeInsets.all(20), child: CircularProgressIndicator())),
            if (!carregando && transacoes.isEmpty) const Padding(padding: EdgeInsets.all(20), child: Text('Nenhuma transação encontrada.')),
            ...transacoes.take(5).map(_transacao),
          ]))),
        ],
      ),
    );
  }

  Widget _card(String titulo, String valor, IconData icon) {
    return Container(
      width: 260,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF30AA55), Color(0xFF1F647B)]), borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Icon(icon, color: Colors.white), const SizedBox(height: 14), Text(titulo, style: const TextStyle(color: Colors.white70)), const SizedBox(height: 8), Text(valor, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700))]),
    );
  }

  Widget _transacao(Transacao t) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(backgroundColor: t.entrada ? AppTheme.verde.withOpacity(.15) : AppTheme.vermelho.withOpacity(.15), child: Icon(t.entrada ? Icons.north_east : Icons.south_east, color: t.entrada ? AppTheme.verde : AppTheme.vermelho)),
      title: Text(t.descricao),
      subtitle: Text('${t.categoria?.nome ?? 'Sem categoria'} · ${t.data == null ? '' : '${t.data!.day.toString().padLeft(2, '0')}/${t.data!.month.toString().padLeft(2, '0')}'}'),
      trailing: Text('${t.entrada ? '+' : '-'} ${moeda(t.valor)}', style: TextStyle(color: t.entrada ? AppTheme.verde : AppTheme.vermelho, fontWeight: FontWeight.w600)),
    );
  }
}
