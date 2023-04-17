import React, { useState } from 'react';
import { Button, CssBaseline, TextField, Paper, Box, Grid, Typography, createTheme, ThemeProvider, makeStyles, Alert } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../../assets/images/logo.png';
import background from '../../../assets/images/login-background.jpg';

const styles = {
    fontFamily: 'Kanit, sans-serif'
};

const theme = createTheme();

const Login = () => {
    const [checkLogin, setCheckLogin] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async (event) => {
        event.preventDefault();
        const username = event.target.elements.username.value;
        const password = event.target.elements.password.value;
        axios
            .post('http://localhost:7000/login', {
                username: username,
                password: password
            })
            .then(function (response) {
                const value = response.data;
                if (value.status == 'ok') {
                    setCheckLogin(false);
                    console.log('value', value);
                    // Set localStorage เพื่อเอาไว้ใช้ในหลายๆหน้า
                    localStorage.setItem('user_data', JSON.stringify(value.data[0]));
                    // Check permission
                    if (value.data[0].user_role == 'hospital staff') {
                        window.location.href = 'http://localhost:3000/home';
                    } else if (value.data[0].user_role == 'admin') {
                        window.location.href = 'http://localhost:3000/';
                    } else {
                        window.location.href = 'http://localhost:3000/dashboard-documents';
                    }
                } else {
                    setCheckLogin(true);
                    console.log('error');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };
    return (
        <ThemeProvider styles={styles}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                {/* Bg Docter */}
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${background})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <img src={logo} alt="logoLogin" style={{ width: 200, marginBottom: 20 }} />
                        <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                            ระบบสนับสนุนการปฏิบัติงาน <br /> สำนักงานสาธารณสุขอำเภอบ้านโพธิ์ จังหวัดฉะเชิงเทรา
                        </Typography>
                        <Box noValidate sx={{ mt: 1 }}>
                            {/* Onsubmit จะทำงานเมื่อกด button type submit  */}
                            <form onSubmit={handleLogin}>
                                <TextField
                                    margin="dense"
                                    id="username"
                                    name="username"
                                    label="ชื่อสมาชิก"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    color="success" // success = green, danger = red,primary = blue
                                    // https://getbootstrap.com/docs/4.0/utilities/colors/
                                    required
                                    sx={{ mt: 1, mb: 2 }}
                                />
                                <TextField
                                    margin="dense"
                                    id="password"
                                    name="password"
                                    label="รหัสผ่าน"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    color="success"
                                    required
                                    sx={{ mt: 2, mb: 2 }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 3,
                                        mb: 2,
                                        backgroundColor: '#357a38',
                                        '&:hover': {
                                            backgroundColor: theme.palette.success.main
                                        }
                                    }}
                                >
                                    เข้าสู่ระบบ
                                </Button>
                            </form>
                            {checkLogin ? (
                                <Typography sx={{ textAlign: 'center', color: 'red' }}>กรุณาตรวจสอบไอดีและรหัสผ่านอีกครั้ง</Typography>
                            ) : null}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

export default Login;
