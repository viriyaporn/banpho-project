import React, { useState } from 'react';
import menuLeft from '../../assets/images/336597097_178106335011664_970700067564541146_n.png';
import menuRight from '../../assets/images/336601094_207769731901640_4066615954395778442_n.png';
import logo from '../../assets/images/logo.png';

import {
    createTheme,
    ThemeProvider,
    makeStyles,
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Checkbox,
    Paper,
    Box,
    Grid,
    Typography,
    Alert
} from '@mui/material';
import { textAlign } from '@mui/system';
import { useNavigate } from 'react-router-dom';

const theme = createTheme();

const Home = () => {
    const navigate = useNavigate();

    const handleMenuLeft = () => {
        navigate('/tracking');
    };

    const handleMenuRight = () => {
        navigate('/documents');
    };

    return (
        <div>
            <div style={{ textAlign: 'center' }}>
                <img src={logo} alt="logoLogin" style={{ width: 230, height: 230, marginBottom: 10 }} />
            </div>

            <Typography
                variant="h2"
                sx={{ fontWeight: 700, textAlign: 'center', marginTop: '20px', marginBottom: '25px', color: '#086c3c' }}
            >
                ระบบสารสนเทศเพื่อสนับสนุนการปฏิบัติงาน สำนักงานสาธารณสุขอำเภอบ้านโพธิ์จังหวัดฉะเชิงเทรา
            </Typography>
            <Grid container>
                <Grid xs={6} sx={{ textAlign: 'center' }} onClick={() => navigate('/tracking')}>
                    <img src={menuLeft} alt="logoLogin" style={{ width: 250, height: 200, marginBottom: 20 }} />
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: '#086c3c', textAlign: 'center', marginTop: '15px', marginBottom: '20px' }}
                    >
                        ระบบติดตามอุปกรณ์ - เครื่องมือการแพทย์
                    </Typography>
                </Grid>
                <Grid xs={6} sx={{ textAlign: 'center' }} onClick={() => navigate('/documents')}>
                    <img src={menuRight} alt="logoLogin" style={{ width: 250, height: 200, marginBottom: 30 }} />
                    <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: '#086c3c', textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}
                    >
                        ระบบจัดการงานสารบรรณ
                    </Typography>
                </Grid>
            </Grid>
        </div>
    );
};

export default Home;
