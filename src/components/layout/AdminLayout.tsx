import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUIStore } from '../../store/ui.store';

const { Content } = Layout;

export function AdminLayout() {
  const { sidebarCollapsed } = useUIStore();
  const marginLeft = sidebarCollapsed ? 64 : 240;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft, transition: 'margin-left 0.2s' }}>
        <TopBar />
        <Content
          className="scrollbar-thin"
          style={{
            padding: 24,
            background: '#F5F7FA',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
