import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { ButtonBase } from '@mui/material';

// project imports
import config from 'config';
import Logo from 'ui-component/Logo';
import { MENU_OPEN } from 'store/actions';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
    const defaultId = useSelector((state) => state.customization.defaultId);
    const dispatch = useDispatch();
    const navigate = useNavigate(); // add this line
    return (
        <ButtonBase
            disableRipple
            onClick={() => {
                dispatch({ type: MENU_OPEN, id: defaultId });
                navigate(config.defaultPath); // use navigate instead of Link
            }}
        >
            <Logo />
        </ButtonBase>
    );
};

export default LogoSection;
