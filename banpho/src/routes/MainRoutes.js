import MainLayout from 'layout/MainLayout';
import DashboardDefault from 'views/dashboard/Default';
import Home from 'views/pages/Home';
import DashboardTracking from 'views/dashboard/Default/DashboardTracking';
import DashboardDocument from 'views/dashboard/Default/DashboardDocument';
import Product from 'views/pages/product/Product';
import ProductForm from 'views/pages/product/ProductFrom';
import Tracking from 'views/pages/tracking/Tracking';
import TrackingProcess from 'views/pages/tracking/TrackingProcess';
import TrackingSuccess from 'views/pages/tracking/TrackingSuccess';
import TrackingForm from 'views/pages/tracking/TrackingForm';
import Documents from 'views/pages/documents/Documents';
import DocumentsApproveUser from 'views/pages/documents/DocumentsApproveUser';
import DocumentsDisapproveUser from 'views/pages/documents/DocumentsDisapproveUser';
import DocumentsDashboard from 'views/pages/documents/DocumentsDashboard';
import DocumentsWaiting from 'views/pages/documents/DocumentsWaiting';
import DocumentsApprove from 'views/pages/documents/DocumentsApprove';
import DocumentsDisapprove from 'views/pages/documents/DocumentsDisapprove';
import Notification from 'views/pages/notification/Notification';
import DashboardManager from 'views/dashboard/Default/DashboardManager';

// Admin
import Users from 'views/pages/admin/Users';
import Hospital from 'views/pages/admin/Hospital';

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/home',
            element: <Home />
        },
        {
            path: '/dashboard-tracking',
            element: <DashboardTracking />
        },
        {
            path: '/tracking',
            element: <Tracking />
        },
        {
            path: '/tracking-process',
            element: <TrackingProcess />
        },
        {
            path: '/tracking-success',
            element: <TrackingSuccess />
        },
        {
            path: '/tracking-form',
            element: <TrackingForm />
        },
        {
            path: '/dashboard-documents',
            element: <DashboardManager />
        },
        {
            path: '/documents',
            element: <Documents />
        },
        {
            path: '/documents-approve',
            element: <DocumentsApproveUser />
        },
        {
            path: '/documents-disapprove',
            element: <DocumentsDisapproveUser />
        },
        {
            path: '/dashboard-document',
            element: <DashboardDocument />
        },
        {
            path: '/report-documents',
            element: <DocumentsWaiting />
        },
        {
            path: '/report-documents-approve',
            element: <DocumentsApprove />
        },
        {
            path: '/report-documents-disapproved',
            element: <DocumentsDisapprove />
        },
        {
            path: '/users',
            element: <Users />
        },
        {
            path: '/hospital',
            element: <Hospital />
        },
        {
            path: '/notification',
            element: <Notification />
        }
    ]
};

export default MainRoutes;
