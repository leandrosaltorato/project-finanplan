import 'package:flutter/material.dart';
import '../models/categoria.dart';
import '../models/transacao.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../services/transacao_service.dart';
import '../theme/app_theme.dart';

class TransacoesPage extends StatefulWidget {
  const TransacoesPage({super.key});
  @override
  State<TransacoesPage> createState() => _TransacoesPageState();
}

class _TransacoesPageState extends State<TransacoesPage> {
  final auth = AuthService();
  final service = TransacaoService();
  final busca = TextEditingController();
  List<Transacao> lista = [];
  List<Categoria> categorias = [];
  String tipo = '';
  String mes = '';
  int? categoriaId;
  int aba = 0;
  int pagina = 1;
  bool carregando = true;
  final int porPagina = 8;

  List<Transacao> get filtradas {
    final texto = busca.text.trim().toLowerCase();
    return lista.where((t) {
      final okTipo = tipo.isEmpty || t.tipo == tipo;
      final okMes = mes.isEmpty || (t.data != null && t.data!.month.toString().padLeft(2, '0') == mes);
      final okCategoria = categoriaId == null || t.categoriaId == categoriaId;
      final okBusca = texto.isEmpty || t.descricao.toLowerCase().contains(texto);
      return okTipo && okMes && okCategoria && okBusca;
    }).toList();
  }

  List<Transacao> get paginaLista {
    final inicio = (pagina - 1) * porPagina;
    if (inicio >= filtradas.length) return [];
    final fim = (inicio + porPagina).clamp(0, filtradas.length);
    return filtradas.sublist(inicio, fim);
  }

  int get paginas => filtradas.isEmpty ? 1 : (filtradas.length / porPagina).ceil();
  double get receitas => filtradas.where((e) => e.entrada).fold(0, (s, e) => s + e.valor);
  double get despesas => filtradas.where((e) => !e.entrada).fold(0, (s, e) => s + e.valor);

  @override
  void initState() {
    super.initState();
    busca.addListener(() => setState(() => pagina = 1));
    iniciar();
  }

  @override
  void dispose() {
    busca.dispose();
    super.dispose();
  }

  Future<void> iniciar() async {
    try {
      final controle = await auth.controleId();
      if (controle == null) return;
      final dados = await Future.wait([service.listar(controle), service.categorias()]);
      if (mounted) setState(() { lista = dados[0] as List<Transacao>; categorias = dados[1] as List<Categoria>; carregando = false; });
    } on ApiException catch (e) {
      if (mounted) { setState(() => carregando = false); mensagem(e.mensagem); }
    }
  }

  Future<void> formulario({Transacao? editar}) async {
    final descricao = TextEditingController(text: editar?.descricao ?? '');
    final valor = TextEditingController(text: editar == null ? '' : editar.valor.toStringAsFixed(2));
    String tipoNova = editar?.tipo ?? 'ENTRADA';
    Categoria? categoria = editar == null ? null : categorias.where((e) => e.id == editar.categoriaId).firstOrNull;

    final salvou = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModal) => AlertDialog(
          title: Text(editar == null ? 'Nova Transação' : 'Editar Transação'),
          content: SizedBox(
            width: 500,
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: descricao, decoration: const InputDecoration(labelText: 'Descrição')),
              const SizedBox(height: 12),
              TextField(controller: valor, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Valor')),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(value: tipoNova, items: const [DropdownMenuItem(value: 'ENTRADA', child: Text('Entrada')), DropdownMenuItem(value: 'SAIDA', child: Text('Saída'))], onChanged: (v) => setModal(() => tipoNova = v!), decoration: const InputDecoration(labelText: 'Tipo')),
              const SizedBox(height: 12),
              DropdownButtonFormField<Categoria>(value: categoria, items: categorias.map((e) => DropdownMenuItem(value: e, child: Text(e.nome))).toList(), onChanged: (v) => setModal(() => categoria = v), decoration: const InputDecoration(labelText: 'Categoria')),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () async {
              final numero = double.tryParse(valor.text.replaceAll(',', '.'));
              final controle = await auth.controleId();
              if (descricao.text.trim().isEmpty || numero == null || numero <= 0 || categoria == null || controle == null) {
                mensagem('Preencha os campos obrigatórios.');
                return;
              }
              try {
                if (editar == null) {
                  await service.cadastrar(descricao.text.trim(), numero, tipoNova, categoria!.id, controle);
                } else {
                  await service.atualizar(editar.id, descricao.text.trim(), numero, tipoNova, categoria!.id, controle);
                }
                if (context.mounted) Navigator.pop(context, true);
              } on ApiException catch (e) {
                mensagem(e.mensagem);
              }
            }, child: Text(editar == null ? 'Salvar' : 'Salvar alterações')),
          ],
        ),
      ),
    );

    descricao.dispose();
    valor.dispose();
    if (salvou == true) iniciar();
  }

  Future<void> excluir(Transacao transacao) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Excluir transação'),
        content: Text('Excluir "${transacao.descricao}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(context, true), style: FilledButton.styleFrom(backgroundColor: AppTheme.vermelho), child: const Text('Excluir')),
        ],
      ),
    );
    if (confirmar != true) return;
    try {
      await service.excluir(transacao.id);
      await iniciar();
    } on ApiException catch (e) {
      mensagem(e.mensagem);
    }
  }

  void limpar() {
    setState(() { tipo = ''; mes = ''; categoriaId = null; aba = 0; pagina = 1; busca.clear(); });
  }

  String moeda(double valor) => 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';

  void mensagem(String texto) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: iniciar,
      child: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Row(children: [const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Transações', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700)), SizedBox(height: 4), Text('Gerencie suas movimentações financeiras', style: TextStyle(color: AppTheme.cinza))])), FilledButton.icon(onPressed: () => formulario(), icon: const Icon(Icons.add), label: const Text('Nova Transação'))]),
          const SizedBox(height: 18),
          Wrap(spacing: 14, runSpacing: 14, children: [
            _resumo('Total de Receitas', moeda(receitas), Icons.arrow_upward),
            _resumo('Total de Despesas', moeda(despesas), Icons.arrow_downward),
            _resumo('Saldo do Mês', moeda(receitas - despesas), Icons.account_balance_wallet),
            _resumo('Transações no Mês', filtradas.length.toString(), Icons.receipt_long),
          ]),
          const SizedBox(height: 18),
          Card(child: Padding(padding: const EdgeInsets.all(14), child: Column(children: [
            Wrap(spacing: 10, runSpacing: 10, children: [
              SizedBox(width: 180, child: DropdownButtonFormField<String>(value: mes.isEmpty ? null : mes, items: const [DropdownMenuItem(value: '01', child: Text('Janeiro')), DropdownMenuItem(value: '02', child: Text('Fevereiro')), DropdownMenuItem(value: '03', child: Text('Março')), DropdownMenuItem(value: '04', child: Text('Abril')), DropdownMenuItem(value: '05', child: Text('Maio')), DropdownMenuItem(value: '06', child: Text('Junho')), DropdownMenuItem(value: '07', child: Text('Julho')), DropdownMenuItem(value: '08', child: Text('Agosto')), DropdownMenuItem(value: '09', child: Text('Setembro')), DropdownMenuItem(value: '10', child: Text('Outubro')), DropdownMenuItem(value: '11', child: Text('Novembro')), DropdownMenuItem(value: '12', child: Text('Dezembro'))], onChanged: (v) => setState(() { mes = v ?? ''; pagina = 1; }), decoration: const InputDecoration(labelText: 'Mês'))),
              SizedBox(width: 180, child: DropdownButtonFormField<String>(value: tipo.isEmpty ? null : tipo, items: const [DropdownMenuItem(value: 'ENTRADA', child: Text('Receitas')), DropdownMenuItem(value: 'SAIDA', child: Text('Despesas'))], onChanged: (v) => setState(() { tipo = v ?? ''; aba = v == 'ENTRADA' ? 1 : 2; pagina = 1; }), decoration: const InputDecoration(labelText: 'Tipo'))),
              SizedBox(width: 200, child: DropdownButtonFormField<int>(value: categoriaId, items: categorias.map((e) => DropdownMenuItem(value: e.id, child: Text(e.nome))).toList(), onChanged: (v) => setState(() { categoriaId = v; pagina = 1; }), decoration: const InputDecoration(labelText: 'Categoria'))),
              SizedBox(width: 250, child: TextField(controller: busca, decoration: const InputDecoration(labelText: 'Buscar transação', prefixIcon: Icon(Icons.search)))),
              TextButton.icon(onPressed: limpar, icon: const Icon(Icons.filter_alt_off), label: const Text('Limpar')),
            ]),
            const SizedBox(height: 12),
            SegmentedButton<int>(segments: const [ButtonSegment(value: 0, label: Text('Todas')), ButtonSegment(value: 1, label: Text('Receitas')), ButtonSegment(value: 2, label: Text('Despesas'))], selected: {aba}, onSelectionChanged: (set) { final v = set.first; setState(() { aba = v; tipo = v == 0 ? '' : v == 1 ? 'ENTRADA' : 'SAIDA'; pagina = 1; }); }),
          ])),
          const SizedBox(height: 12),
          Card(child: Column(children: [
            if (carregando) const Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()),
            if (!carregando && paginaLista.isEmpty) const Padding(padding: EdgeInsets.all(30), child: Text('Nenhuma transação encontrada.')),
            ...paginaLista.map(_linha),
            if (filtradas.isNotEmpty) Padding(padding: const EdgeInsets.all(10), child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [IconButton(onPressed: pagina > 1 ? () => setState(() => pagina--) : null, icon: const Icon(Icons.chevron_left)), Text('$pagina / $paginas'), IconButton(onPressed: pagina < paginas ? () => setState(() => pagina++) : null, icon: const Icon(Icons.chevron_right))])),
          ])),
        ],
      ),
    );
  }

  Widget _resumo(String titulo, String valor, IconData icon) {
    return SizedBox(width: 260, child: Card(child: Padding(padding: const EdgeInsets.all(18), child: Row(children: [CircleAvatar(backgroundColor: AppTheme.verde.withOpacity(.12), child: Icon(icon, color: AppTheme.verde)), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(titulo, style: const TextStyle(color: AppTheme.cinza)), const SizedBox(height: 5), Text(valor, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700))]))])));
  }

  Widget _linha(Transacao t) {
    return ListTile(
      leading: CircleAvatar(backgroundColor: t.entrada ? AppTheme.verde.withOpacity(.12) : AppTheme.vermelho.withOpacity(.12), child: Icon(t.entrada ? Icons.arrow_upward : Icons.arrow_downward, color: t.entrada ? AppTheme.verde : AppTheme.vermelho)),
      title: Text(t.descricao),
      subtitle: Text('${t.categoria?.nome ?? 'Sem categoria'} · ${t.data == null ? '' : '${t.data!.day.toString().padLeft(2, '0')}/${t.data!.month.toString().padLeft(2, '0')}/${t.data!.year}'}'),
      trailing: Wrap(crossAxisAlignment: WrapCrossAlignment.center, children: [Text('${t.entrada ? '+' : '-'} ${moeda(t.valor)}', style: TextStyle(color: t.entrada ? AppTheme.verde : AppTheme.vermelho, fontWeight: FontWeight.w600)), IconButton(onPressed: () => formulario(editar: t), icon: const Icon(Icons.edit)), IconButton(onPressed: () => excluir(t), icon: const Icon(Icons.delete_outline))]),
    );
  }
}
