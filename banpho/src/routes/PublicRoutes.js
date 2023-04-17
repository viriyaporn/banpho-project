import MinimalLayout from 'layout/MinimalLayout';
import Qrcode from 'views/pages/public-link/TrackingQrcode';
import TrackingForm from 'views/pages/public-link/TrackingForm';
import SuccessForm from 'views/pages/public-link/SuccessUpdate';

const PublicRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/tracking-link',
            element: <TrackingForm />
        },
        {
            path: '/tracking-qrcode',
            element: <Qrcode />
        },
        {
            path: '/success',
            element: <SuccessForm />
        }
    ]
};

export default PublicRoutes;
