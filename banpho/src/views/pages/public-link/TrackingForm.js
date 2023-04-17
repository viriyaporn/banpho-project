import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../../assets/images/logo.png';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    FormControlLabel,
    Grid,
    Typography,
    Container,
    Box,
    Link,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ListItemIcon
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import moment from 'moment/moment';
import axios from 'axios';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const theme = createTheme();

const TrackingForm = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const track = searchParams.get('track');
    const [data, setData] = useState();
    const [recipient, setRecipient] = useState();
    const [date, setDate] = useState();
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openPickup, setOpenPickup] = useState(false);
    const [status, setStatus] = useState();
    const [checkDate, setCheckDate] = useState(false);
    const navigate = useNavigate();
    const [meetDate, setMeetDate] = useState();
    useEffect(() => {
        axios
            .get(`http://localhost:7000/tracking-data/${track}`)
            .then((response) => {
                console.log(response.data.data[0]);
                const value = response?.data?.data[0];
                setData(value);
                setStatus(value.tracking_status);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const styles = {
        fontFamily: 'Kanit, sans-serif'
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const recipient = event.target.elements.recipient.value;
        const date = event.target.elements.date.value;
        setRecipient(recipient);
        setDate(date);
        setOpenConfirm(true);
    };

    const handlePickup = (event) => {
        event.preventDefault();
        const date = event.target.elements.date.value;
        setDate(date);
        setOpenPickup(true);
    };

    const handleClosePickup = () => {
        setOpenPickup(false);
    };

    const handleConfirm = () => {
        setOpenConfirm(true);
    };

    const handleGetBack = (event) => {
        axios
            .put(`http://localhost:7000/tracking-back/${track}`)
            .then(function (response) {
                setOpenConfirm(false);
                window.open('about:blank', '_self');
                window.close();
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const handleClickOpen = () => {
        setOpenConfirm(true);
    };

    const handleClose = () => {
        setCheckDate(false);
        setOpenConfirm(false);
    };

    const handleAccept = () => {
        axios
            .put(`http://localhost:7000/tracking/${track}`, {
                recipient: recipient,
                date: date
            })
            .then(function (response) {
                if (response.data.status == 'error') {
                    setCheckDate(true);
                } else {
                    setOpenConfirm(false);
                    window.open('about:blank', '_self');
                    window.close();
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    return status == 'จัดส่งอุปกรณ์-เครื่องมือการแพทย์' ? (
        <ThemeProvider theme={styles}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <img src={logo} alt="logo" style={{ width: 200, marginBottom: 20 }} />

                    <p style={{ fontSize: '26px' }}>ยืนยันสถานะการรับอุปกรณ์</p>
                    <p style={{ fontSize: '18px', textAlign: 'center' }}>{data.tracking_hospital}</p>
                    <p style={{ fontSize: '18px' }}>{track}</p>

                    <form onSubmit={handleSubmit}>
                        <Box>
                            <TextField
                                sx={{ mt: 2 }}
                                margin="normal"
                                required
                                fullWidth
                                id="recipient"
                                label="ชื่อผู้รับ"
                                name="recipient"
                                color="success"
                            />
                            <TextField
                                id="date"
                                name="date"
                                label="วันนัดรับอุปกรณ์"
                                type="date"
                                color="success"
                                required
                                fullWidth
                                sx={{ mt: 2 }}
                                InputLabelProps={{
                                    shrink: true
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 1,
                                    backgroundColor: '#357a38',
                                    '&:hover': {
                                        backgroundColor: '#43a047'
                                    }
                                }}
                            >
                                ยืนยันการรับอุปกรณ์
                            </Button>
                        </Box>
                    </form>
                </Box>
                <Dialog
                    fullWidth={true}
                    maxWidth={'sm'}
                    open={openConfirm}
                    onClose={handleClose}
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        <Box textAlign="center">
                            <CheckCircleOutlineOutlinedIcon sx={{ color: '#357a38', fontSize: 180 }} />
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#357a38' }}
                        >
                            ยืนยันการรับอุปกรณ์
                        </Typography>
                        {checkDate ? (
                            <Typography sx={{ color: 'red', textAlign: 'center' }}>
                                วันที่ที่ระบุไม่ถูกต้อง กรุณาระบุใหม่อีกครั้ง
                            </Typography>
                        ) : null}
                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleClose}>
                                ย้อนกลับ
                            </Button>
                            <Button variant="outlined" color="success" sx={{ marginLeft: 3, borderRadius: 100 }} onClick={handleAccept}>
                                ยืนยัน
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Container>
        </ThemeProvider>
    ) : status === 'กระบวนการฆ่าเชื้อ' ? (
        <ThemeProvider theme={styles}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />

                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}
                >
                    <img src={logo} alt="logo" style={{ width: 200, marginBottom: 20 }} />
                    <p style={{ fontSize: '26px' }}>ยืนยันการรับคืน</p>
                    <p style={{ fontSize: '18px', textAlign: 'center' }}>{data.tracking_hospital}</p>
                    <p style={{ fontSize: '18px' }}>{track}</p>
                    <Box sx={{ mt: 1 }}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                display: 'block',
                                displayPrint: 'none',
                                margin: '0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#357a38',
                                '&:hover': {
                                    backgroundColor: '#43a047'
                                }
                            }}
                            onClick={handleConfirm}
                        >
                            เสร็จสิ้นกระบวนการส่งอุปกรณ์ไปฆ่าเชื้อ
                        </Button>
                    </Box>
                </Box>
                <Dialog
                    fullWidth={true}
                    maxWidth={'sm'}
                    open={openConfirm}
                    onClose={handleClose}
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        <Box textAlign="center">
                            <CheckCircleOutlineOutlinedIcon sx={{ color: '#357a38', fontSize: 180 }} />
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#357a38' }}
                        >
                            ยืนยันการรับอุปกรณ์
                        </Typography>
                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleClose}>
                                ย้อนกลับ
                            </Button>
                            <Button variant="outlined" color="success" sx={{ marginLeft: 3, borderRadius: 100 }} onClick={handleGetBack}>
                                ยืนยัน
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Container>
        </ThemeProvider>
    ) : (
        ''
    );
};

export default TrackingForm;
