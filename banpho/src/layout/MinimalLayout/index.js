import { Outlet } from 'react-router-dom';

// project imports
import Customization from '../Customization';

const MinimalLayout = () => (
    <>
        <div>
            <Outlet />
            <Customization />
        </div>
    </>
);

export default MinimalLayout;
