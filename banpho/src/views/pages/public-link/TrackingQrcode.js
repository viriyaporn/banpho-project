import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, Box, Button } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, useLocation } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import logo from '../../../assets/images/logo.png';

const TrackingQrcode = () => {
    const [url, setUrl] = useState(null);
    const [id, setId] = useState();
    const [isPrinting, setIsPrinting] = useState(false);
    const [value, setValue] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const { state } = useLocation();
    const { params } = state;
    useEffect(() => {
        axios
            .get(`http://localhost:7000/tracking-data/${params}`)
            .then((response) => {
                setValue(response.data.data[0]);
            })
            .catch((error) => {
                console.error(error);
            });
        getEquipment();
    }, []);

    const handlePrint = () => {
        setIsPrinting(true);
        window.print();
    };

    const getEquipment = () => {
        axios
            .get(`http://localhost:7000/tracking-item/${params}`)
            .then((response) => {
                console.log('equipment', response.data.data);
                setEquipment(response.data.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <div>
            <Grid sx={{ textAlign: 'center' }}>
                <img src={logo} alt="logo" style={{ width: 200, marginTop: 15 }} />
                <p style={{ fontSize: '26px', fontWeight: 600 }}>{params}</p>
                <p style={{ fontSize: '26px', fontWeight: 600 }}>{value.tracking_hospital}</p>
                <Grid container sx={{ marginBottom: 3 }}>
                    <Grid xs={5.5} sx={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '22px' }}>อุปกรณ์ที่นำส่ง : </span>
                    </Grid>
                    <Grid xs={6} sx={{ textAlign: 'left' }}>
                        {equipment.map((item, index) => (
                            <span style={{ fontSize: '22px' }}>
                                {index + 1}.) {item.equipment_name} จำนวน : {item.equipment_quantity} ชิ้น <br />
                            </span>
                        ))}
                    </Grid>
                </Grid>
                <QRCodeSVG
                    value={`http://localhost:3000/tracking-link?track=${params}`}
                    size={350}
                    bgColor={'#ffffff'}
                    fgColor={'#000000'}
                    level={'L'}
                    includeMargin={false}
                />
                <p style={{ fontSize: '26px', marginTop: '30px', marginBottom: '20px' }}>โปรดแสกน QR CODE นี้เพื่ออัปเดตสถานะ</p>
                <Typography sx={{ fontSize: '20px', color: 'red', displayPrint: 'none', marginBottom: '20px' }}>
                    พิมพ์เอกสารเพื่อให้เจ้าหน้าที่อัพเดทสถานะ
                </Typography>

                <Box>
                    <Button
                        variant="contained"
                        onClick={handlePrint}
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
                    >
                        <PrintIcon sx={{ mr: '0.5rem' }} />
                        <Typography>พิมพ์เอกสาร</Typography>
                    </Button>
                </Box>
            </Grid>
        </div>
    );
};

export default TrackingQrcode;
