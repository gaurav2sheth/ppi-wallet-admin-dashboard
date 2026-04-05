import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="You don't have permission to access this page."
      extra={<Button type="primary" onClick={() => navigate('/')}>Back to Dashboard</Button>}
    />
  );
}
