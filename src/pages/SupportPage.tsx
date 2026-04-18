import { useEffect } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { SupportAgentPanel } from '../components/support/SupportAgentPanel';
import { useUIStore } from '../store/ui.store';

export function SupportPage() {
  const { setBreadcrumbs } = useUIStore();

  useEffect(() => {
    setBreadcrumbs([{ title: 'Support' }]);
  }, [setBreadcrumbs]);

  return (
    <div>
      <PageHeader title="Support Operations" subtitle="AI support agent monitoring, tickets, and escalations" />
      <SupportAgentPanel />
    </div>
  );
}
