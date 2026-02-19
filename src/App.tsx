import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Campaigns from '@/pages/Campaigns';
import CampaignDetail from '@/pages/CampaignDetail';
import Prospects from '@/pages/Prospects';
import Lists from '@/pages/Lists';
import Senders from '@/pages/Senders';
import Messages from '@/pages/Messages';
import Tags from '@/pages/Tags';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="campaigns/:id" element={<CampaignDetail />} />
                <Route path="prospects" element={<Prospects />} />
                <Route path="lists" element={<Lists />} />
                <Route path="senders" element={<Senders />} />
                <Route path="messages" element={<Messages />} />
                <Route path="tags" element={<Tags />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}
