import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/LandingPage.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProfilePage from './features/user/ProfilePage.jsx';
import AdminDashboard from './features/admin/AdminDashboard.jsx';
import UserManagement from './features/admin/UserManagement.jsx';
import DriverList from './features/admin/drivers/DriverList.jsx';
import DriverDetail from './features/admin/drivers/DriverDetail.jsx';
import VehicleList from './features/admin/vehicles/VehicleList.jsx';
import RouteList from './features/admin/routes/RouteList.jsx';
import PlanList from './features/admin/plans/PlanList.jsx';
import AdminAttendanceHistory from './features/admin/attendance/AdminAttendanceHistory.jsx';
import DriverDashboard from './features/driver/DriverDashboard.jsx';
import DriverOnboarding from './features/driver/DriverOnboarding.jsx';
import DocumentUpload from './features/driver/DocumentUpload.jsx';
import MarkAttendance from './features/driver/attendance/MarkAttendance.jsx';
import AttendanceHistory from './features/driver/attendance/AttendanceHistory.jsx';
import Earnings from './features/driver/earnings/Earnings.jsx';
import MyAttendance from './features/user/MyAttendance.jsx';
import SubscriptionCreate from './features/subscription/SubscriptionCreate.jsx';
import MySubscriptions from './features/subscription/MySubscriptions.jsx';
import SubscriptionDetail from './features/subscription/SubscriptionDetail.jsx';
import SubscriptionList from './features/admin/subscriptions/SubscriptionList.jsx';
import Checkout from './features/payment/Checkout.jsx';
import PaymentSuccess from './features/payment/PaymentSuccess.jsx';
import PaymentHistory from './features/payment/PaymentHistory.jsx';
import InvoiceView from './features/payment/InvoiceView.jsx';
import CreateComplaint from './features/complaint/CreateComplaint.jsx';
import MyComplaints from './features/complaint/MyComplaints.jsx';
import ComplaintDetail from './features/complaint/ComplaintDetail.jsx';
import ComplaintList from './features/admin/complaints/ComplaintList.jsx';
import PayoutList from './features/admin/payouts/PayoutList.jsx';



function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/driver/register" element={<DriverOnboarding />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/complaints" element={<MyComplaints />} />
          <Route path="/complaints/new" element={<CreateComplaint />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['user']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/subscriptions" element={<MySubscriptions />} />
          <Route path="/subscriptions/new" element={<SubscriptionCreate />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
          <Route path="/subscriptions/:id/checkout" element={<Checkout />} />
          <Route path="/subscriptions/:id/payment-success" element={<PaymentSuccess />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/payments/:id/invoice" element={<InvoiceView />} />
          <Route path="/my-attendance" element={<MyAttendance />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/documents" element={<DocumentUpload />} />
          <Route path="/driver/attendance" element={<MarkAttendance />} />
          <Route path="/driver/attendance/history" element={<AttendanceHistory />} />
          <Route path="/driver/earnings" element={<Earnings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/drivers" element={<DriverList />} />
          <Route path="/admin/drivers/:id" element={<DriverDetail />} />
          <Route path="/admin/vehicles" element={<VehicleList />} />
          <Route path="/admin/routes" element={<RouteList />} />
          <Route path="/admin/plans" element={<PlanList />} />
          <Route path="/admin/subscriptions" element={<SubscriptionList />} />
          <Route path="/admin/complaints" element={<ComplaintList />} />
          <Route path="/admin/payouts" element={<PayoutList />} />
          <Route path="/admin/attendance" element={<AdminAttendanceHistory />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;