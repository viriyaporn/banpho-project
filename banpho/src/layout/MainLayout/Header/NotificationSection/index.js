import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    CardActions,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// assets
import { IconBell } from '@tabler/icons';

// ==============================|| NOTIFICATION ||============================== //

const NotificationSection = () => {
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);
    const navigate = useNavigate();

    /**
     * anchorRef is used on different componets and specifying one type leads to other components throwing an error
     * */

    const handleNotification = () => {
        navigate('/notification');
    };

    const loadNotificationCount = (value) => {
        console.log(value);
        let role = value.role_status;
        let hospital = value.hospital_id;
        axios
            .get(`http://localhost:7000/notification-count/${role}/${hospital}}`)
            .then((response) => {
                let value = response.data.count[0].count;
                setNotificationCount(value);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        loadNotificationCount(JSON.parse(userData));
    }, []);

    return (
        <>
            <Box
                sx={{
                    ml: 2,
                    mr: 3,
                    [theme.breakpoints.down('md')]: {
                        mr: 2
                    }
                }}
            >
                <ButtonBase sx={{ borderRadius: '12px' }} onClick={handleNotification}>
                    {notificationCount > 0 ? (
                        <Badge color="error" badgeContent={notificationCount}>
                            <Avatar
                                variant="rounded"
                                sx={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.mediumAvatar,
                                    transition: 'all .2s ease-in-out',
                                    background: theme.palette.success.medium,
                                    color: '#fff',
                                    '&[aria-controls="menu-list-grow"],&:hover': {
                                        background: theme.palette.success.medium,
                                        color: theme.palette.success.light
                                    }
                                }}
                                aria-controls={open ? 'menu-list-grow' : undefined}
                                aria-haspopup="true"
                                onClick={handleNotification}
                                color="inherit"
                            >
                                <IconBell stroke={1.5} size="1.3rem" />
                            </Avatar>
                        </Badge>
                    ) : (
                        <Avatar
                            variant="rounded"
                            sx={{
                                ...theme.typography.commonAvatar,
                                ...theme.typography.mediumAvatar,
                                transition: 'all .2s ease-in-out',
                                background: theme.palette.success.main,
                                color: '#fff',
                                '&[aria-controls="menu-list-grow"],&:hover': {
                                    background: theme.palette.success.medium,
                                    color: theme.palette.success.light
                                }
                            }}
                            aria-controls={open ? 'menu-list-grow' : undefined}
                            aria-haspopup="true"
                            onClick={handleNotification}
                            color="inherit"
                        >
                            <IconBell stroke={1.5} size="1.5rem" />
                        </Avatar>
                    )}
                </ButtonBase>
            </Box>
        </>
    );
};

export default NotificationSection;
