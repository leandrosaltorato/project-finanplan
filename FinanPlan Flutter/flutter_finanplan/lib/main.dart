import 'package:flutter/material.dart';

import 'pages/dashboard.dart';
import 'pages/transacoes.dart';
import 'theme/colors.dart';
import 'theme/theme.dart';

void main() {
  runApp(const FinanPlanApp());
}

class FinanPlanApp extends StatelessWidget {
  const FinanPlanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'FinanPlan',
      theme: AppTheme.light,
      home: const FinanPlanShell(),
    );
  }
}

class FinanPlanShell extends StatefulWidget {
  const FinanPlanShell({super.key});

  @override
  State<FinanPlanShell> createState() => _FinanPlanShellState();
}

class _FinanPlanShellState extends State<FinanPlanShell> {
  int selectedPage = 0;

  final pages = const [DashboardPage(), TransactionsPage()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: _buildMobileDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            _buildMobileHeader(),
            Expanded(child: pages[selectedPage]),
          ],
        ),
      ),
    );
  }

  Widget _buildMobileHeader() {
    return Container(
      height: 64,
      width: double.infinity,
      color: AppColors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Builder(
            builder: (context) {
              return IconButton(
                onPressed: () {
                  Scaffold.of(context).openDrawer();
                },
                icon: const Icon(
                  Icons.menu_rounded,
                  size: 26,
                  color: AppColors.text,
                ),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 42, minHeight: 42),
              );
            },
          ),
          const SizedBox(width: 6),
          Image.asset(
            'assets/logopjtsreal.png',
            width: 90,
            fit: BoxFit.contain,
          ),
          const Spacer(),
          const Icon(
            Icons.notifications_none_rounded,
            size: 23,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 10),
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: AppColors.green.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.person_outline_rounded,
              size: 19,
              color: AppColors.greenDark,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMobileDrawer() {
    return Drawer(
      width: 285,
      backgroundColor: AppColors.white,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              height: 82,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 24),
              alignment: Alignment.centerLeft,
              child: Image.asset(
                'assets/logopjtsreal.png',
                width: 125,
                fit: BoxFit.contain,
              ),
            ),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: 14),
            _drawerItem(
              icon: Icons.dashboard_rounded,
              label: 'Dashboard',
              index: 0,
            ),
            _drawerItem(
              icon: Icons.swap_horiz_rounded,
              label: 'Transações',
              index: 1,
            ),
            _drawerItem(
              icon: Icons.account_balance_wallet_rounded,
              label: 'Orçamentos',
              index: 2,
            ),
            _drawerItem(
              icon: Icons.track_changes_rounded,
              label: 'Metas',
              index: 3,
            ),
            _drawerItem(
              icon: Icons.settings_rounded,
              label: 'Configurações',
              index: 4,
            ),
            const Spacer(),
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppColors.green.withOpacity(0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.person_outline_rounded,
                      color: AppColors.greenDark,
                    ),
                  ),
                  const SizedBox(width: 11),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Matheus Spineli',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.text,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Minha conta',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem({
    required IconData icon,
    required String label,
    required int index,
  }) {
    final bool isSelected = selectedPage == index;

    return Container(
      height: 52,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: isSelected
            ? AppColors.green.withOpacity(0.10)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: index < pages.length
            ? () {
                setState(() {
                  selectedPage = index;
                });

                Navigator.of(context).pop();
              }
            : null,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Icon(
                icon,
                size: 21,
                color: isSelected
                    ? AppColors.greenDark
                    : AppColors.textSecondary,
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? AppColors.greenDark
                        : AppColors.textSecondary,
                  ),
                ),
              ),
              if (isSelected)
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.greenDark,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
