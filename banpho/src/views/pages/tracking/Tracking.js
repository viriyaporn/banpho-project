import React, { useState, useEffect } from 'react';
import moment from 'moment/moment'; // จัดการวันเวลา
import { useNavigate } from 'react-router-dom'; // ไว้ใช้คำสั่งเปลี่ยนหน้า
import AddCircleIcon from '@mui/icons-material/AddCircle'; // ไอคอนธรรมดา
import {
    Card,
    Typography, // Text
    Button,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Grid,
    Select,
    MenuItem
} from '@mui/material';
import axios from 'axios'; // ตัว Call ระหว่าง API กับ Frontend
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';

const Tracking = () => {
    const [user, setUser] = useState();
    const [rows, setRows] = useState([]);
    const [item, setItem] = useState();
    const [showItem, setShowItem] = useState([]);
    const [open, setOpen] = useState(false);
    const [openCheck, setOpenCheck] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [page, setPage] = useState(0);
    const [equipment, setEquipment] = useState([]);
    const [track, setTrack] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [history, setHistory] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [activeStepTracking, setActiveStepTracking] = useState(0);
    const [selectedEquipment, setSelectedEquipment] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // useEffect มีหน้าที่สำหรับเเมื่อหน้านี้ทำงานจะให้ทำในส่วนอันนี้เลย
    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        const storage = JSON.parse(userData);
        console.log('storage =>', storage);
        setUser(storage);
        getData(storage);
    }, []);

    // ดึงข้อมูลจาก API มาในรูปแบบ GET เพื่อเตรียมค่าลงในตาราง
    function getData(value) {
        // const id = value.user_id;
        //
        const id = value.hospital_id;
        const status = 'จัดส่งอุปกรณ์-เครื่องมือการแพทย์';
        axios
            .get(`http://localhost:7000/tracking/${id}/${status}`)
            .then((response) => {
                const value = response.data.data;
                console.log(value);
                // นำค่าที่ได้จาก API มาเก็บที่ Row
                setRows(
                    value.map((item, index) =>
                        createData(
                            index + 1,
                            item.date_at,
                            item.group_id,
                            item.tracking_sender,
                            item.tracking_status,
                            item.tracking_meet_date
                        )
                    )
                );
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // สร้างข้อมูลที่นำมาจาก API
    function createData(date, code, status) {
        return { date, code, status };
    }

    // ปุ่มดวงตาสำหรับดูรายละเอียดแต่ละอัน
    const handleCheck = (row) => {
        const track = row.track;
        axios
            .get(`http://localhost:7000/tracking-data/${track}`)
            .then((response) => {
                console.log(response.data);
                setHistory(response.data.data[0]);
                let status = response.data.data[0].tracking_status;
                if (status == 'จัดส่งอุปกรณ์-เครื่องมือการแพทย์') {
                    setActiveStepTracking(1);
                } else if (status == 'กระบวนการฆ่าเชื้อ') {
                    setActiveStepTracking(2);
                } else if (status == 'เสร็จสิ้น') {
                    setActiveStepTracking(3);
                }
            })
            .catch((error) => {
                console.error(error);
            });

        axios
            .get(`http://localhost:7000/tracking-item/${track}`)
            .then((response) => {
                setShowItem(response.data.data);
            })
            .catch((error) => {
                console.error(error);
            });

        setOpenCheck(true);
    };

    const handleQrcode = (row) => {
        console.log('row =>', row);
        navigate('/tracking-qrcode', { state: { params: row.track } }); // /tracking-qrcode
    };

    // เซตหัวข้อ columns
    const columns = [
        { id: 'order', label: 'ลำดับที่', minWidth: 100 },
        { id: 'date', label: 'วันที่ส่ง', minWidth: 100 },
        { id: 'track', label: 'รหัสชุด', minWidth: 100 },
        { id: 'sender', label: 'ผู้ส่ง', minWidth: 100 },
        { id: 'status', label: 'สถานะ', minWidth: 100 },
        { id: 'dateGet', label: 'วันนัดรับอุปกรณ์', minWidth: 100 },
        {
            id: 'check',
            label: 'ตรวจสอบ',
            minWidth: 50,
            render: (row) => (
                <>
                    <IconButton aria-label="check" onClick={() => handleCheck(row)}>
                        <VisibilityRoundedIcon />
                    </IconButton>
                    <IconButton aria-label="qrcode" onClick={() => handleQrcode(row)}>
                        <QrCode2Icon />
                    </IconButton>
                </>
            )
        }
    ];

    // ชื่อสเต็ป
    const stepsTracking = [
        {
            label: 'จัดส่งอุปกรณ์-เครื่องมือการแพทย์'
        },
        {
            label: 'กระบวนการฆ่าเชื้อ'
        },
        {
            label: 'เสร็จสิ้น'
        }
    ];

    // นำค่าไปใส่ในตาราง
    function createData(order, date, track, sender, status, dateGet) {
        const formattedDate = moment(date).format('DD-MM-YYYY');
        const formattedDateGet = dateGet === null ? '-' : moment(dateGet).format('DD-MM-YYYY');
        return { order, date: formattedDate, track, sender, status, dateGet: formattedDateGet };
    }

    // เปลี่ยนหน้า
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // เซ็ตหน้าว่าอยู่หน้าไหน
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpen = () => {
        setOpen(true);
        randomTrack();
    };

    const handleClose = () => {
        setOpen(false);
    };

    // บันทึกฟอร์ม
    const handleSaveForm = () => {
        axios
            .post('http://localhost:7000/create-tracking', {
                id: track,
                items: equipment,
                count: equipment.length,
                sender: user.user_firstname + ' ' + user.user_lastname,
                date: moment().format('YYYY-MM-DD'),
                user_id: user.user_id,
                hospital: user.hospital_id,
                place: user.user_place
            })
            .then(function (response) {
                console.log(response); // print
                const value = response.data;
                if (value.status == 'ok') {
                    getData(user);
                }
            })
            .catch(function (error) {
                console.log(error);
            });

        setOpen(false);
        setActiveStep(0);
        setEquipment([]);
    };

    // บันทึกอุปกรณ์ที่ถูกเลือก
    const handleSubmit = (event) => {
        event.preventDefault(); // prevent form submission
        const name = selectedEquipment;
        const quantity = event.target.elements.quantity.value;

        // ถ้ามีชื่ออุปกรณ์และจำนวนส่งมา
        if (name && quantity) {
            const newEquipment = { name, quantity };
            setEquipment([...equipment, newEquipment]);

            // reset the form fields
            setSelectedEquipment(null);
            event.target.elements.quantity.value = '';
        }
    };

    // ลบอุปกรณ์ที่ถูกเลือก
    const handleDeleteEquipment = (key) => {
        // Remove the item from the equipment array using its key value as the index
        setEquipment((prevEquipment) => prevEquipment.filter((item, index) => index !== key));
    };

    // สุ่ม Track
    const randomTrack = () => {
        var track = `BPTH-${user.hospital_id}${moment().format('YYYYMMDDHHmmss')}`;
        setTrack(track);
    };

    const handleClickOpenCheck = () => {
        setOpenCheck(true);
    };

    const handleCloseCheck = () => {
        setOpenCheck(false);
    };

    const handleNext = () => {
        setSelectedEquipment(null);
        if (equipment.length > 0) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setSelectedEquipment(null);
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleClickOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleEquipmentChange = (event) => {
        const value = event.target.value;
        setSelectedEquipment(value);
    };

    const searchValue = () => {
        //
    };

    const filteredRows = rows.filter((row) => {
        return Object.values(row).some((value) => {
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
    });

    return (
        <div>
            <Card sx={{ minWidth: 275, minHeight: '100vh' }}>
                <div className="header-show-detail" style={{ backgroundColor: '#086c3c', padding: '15px' }}>
                    <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff', textAlign: 'center' }}>
                        จัดส่งอุปกรณ์-เครื่องมือการแพทย์
                    </Typography>
                </div>
                {/* ช่องค้นหา */}
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 5, marginTop: 3 }}>
                    <Typography sx={{ fontWeight: 500 }}>ค้นหา </Typography>
                    <TextField
                        margin="dense"
                        id="search"
                        name="search"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ marginLeft: 2, width: '75%' }}
                    />
                </Box>
                {/* สร้างชุด Tracking */}
                <Button
                    variant="outlined"
                    onClick={handleClickOpen}
                    sx={{ float: 'right', marginRight: 5 }}
                    color="success"
                    startIcon={<AddCircleIcon />}
                >
                    นำส่งอุปกรณ์
                </Button>
                <Paper
                    sx={{
                        width: '100%',
                        overflow: 'hidden',
                        textAlign: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '30px'
                    }}
                >
                    {/* ตาราง */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {/* เซตหัวข้อของตาราง */}
                                    {columns.map((column) => (
                                        <TableCell key={column.id} align="center" style={{ minWidth: column.minWidth }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.order}>
                                        {/* นำค่าที่ได้จากการ GET ข้อมูลที่จะเอามาใส่ตารางนำมาใส่ */}
                                        {columns.map((column) => (
                                            <TableCell key={column.id} align="center">
                                                {column.render ? column.render(row) : row[column.id]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
                {/* const [open,setOpen] = useState(false) */}
                <Dialog maxWidth={'sm'} open={open} onClose={handleClose}>
                    <DialogTitle sx={{ backgroundColor: '#086c3c' }}>
                        <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                            แบบฟอร์มการนำส่งอุปกรณ์-เครื่องมือการแพทย์
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ marginTop: 3 }}>
                        {activeStep === 0 && (
                            <form onSubmit={handleSubmit}>
                                <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                    ชื่ออุปกรณ์ - เครื่องมือการแพทย์
                                </Typography>
                                <Select
                                    labelId="quantity-label"
                                    id="name"
                                    name="name"
                                    fullWidth
                                    value={selectedEquipment}
                                    onChange={handleEquipmentChange}
                                    variant="outlined"
                                    sx={{ marginTop: '20px', marginBottom: '10px' }}
                                >
                                    <MenuItem value="ชุดทำแผล A">ชุดทำแผล A</MenuItem>
                                    <MenuItem value="ชุดทำแผล B">ชุดทำแผล B</MenuItem>
                                    <MenuItem value="ชุดทำแผล C">ชุดทำแผล C</MenuItem>
                                    <MenuItem value="ชุดทำฟัน A">ชุดทำฟัน A</MenuItem>
                                    <MenuItem value="ชุดทำฟัน B">ชุดทำฟัน B</MenuItem>
                                </Select>
                                <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                    จำนวนที่ต้องการส่ง
                                </Typography>
                                <TextField
                                    margin="dense"
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    fullWidth
                                    placeholder="กรุณาระบุจำนวน"
                                    variant="outlined"
                                    sx={{ marginTop: '20px', marginBottom: '10px' }}
                                />
                                <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        type="submit"
                                        style={{ fontSize: '16px', borderRadius: 100 }}
                                    >
                                        เพิ่มรายการ
                                    </Button>
                                </Box>
                                {equipment.length > 0 ? (
                                    <>
                                        <div
                                            className="header-show-detail"
                                            style={{ backgroundColor: '#086c3c', padding: '15px', borderRadius: 100 }}
                                        >
                                            <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                                                รายการทั้งหมด
                                            </Typography>
                                        </div>
                                        {/* {name:เครืองมือ1 quantity:4} */}
                                        {/* {name:เครืองมือ2 quantity:4} */}
                                        {/* {name:เครืองมือ3 quantity:4} */}
                                        {equipment.map((item, key) => (
                                            <li key={key} style={{ listStyle: 'none', marginTop: 20 }}>
                                                <Grid container>
                                                    <Grid item xs={1} style={{ fontSize: '16px' }}>
                                                        {key + 1}.
                                                    </Grid>
                                                    <Grid item xs={5} style={{ fontSize: '16px' }}>
                                                        {item.name}
                                                    </Grid>
                                                    <Grid item xs={4} style={{ fontSize: '16px' }}>
                                                        จำนวน : {item.quantity}
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <IconButton onClick={() => handleDeleteEquipment(key)} color="error" size="small">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </li>
                                        ))}
                                    </>
                                ) : (
                                    ''
                                )}
                                <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleClose}>
                                        ย้อนกลับ
                                    </Button>
                                    {equipment.length > 0 ? (
                                        <Button
                                            type="submit"
                                            variant="outlined"
                                            color="success"
                                            sx={{ marginLeft: 3, borderRadius: 100 }}
                                            onClick={handleNext}
                                        >
                                            ต่อไป
                                        </Button>
                                    ) : (
                                        ''
                                    )}
                                </Box>
                            </form>
                        )}
                        {activeStep === 1 && (
                            <>
                                <Typography
                                    variant="h3"
                                    sx={{ fontWeight: 600, textAlign: 'left', marginTop: '3px', marginBottom: '30px', color: '#086c3c' }}
                                >
                                    ตรวจสอบรายการทั้งหมด
                                </Typography>
                                {equipment.map((item, key) => (
                                    <li style={{ fontSize: '18px', marginTop: '10px', listStyle: 'none' }} key={key}>
                                        <Grid container>
                                            <Grid item xs={1} style={{ fontSize: '18px' }}>
                                                {key + 1} .
                                            </Grid>
                                            <Grid item xs={5} style={{ fontSize: '18px' }}>
                                                {item.name}
                                            </Grid>
                                            <Grid item xs={4} style={{ fontSize: '18px' }}>
                                                จำนวน : {item.quantity}
                                            </Grid>
                                        </Grid>
                                    </li>
                                ))}
                                <Box textAlign="center" sx={{ marginTop: '45px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleBack}>
                                        ย้อนกลับ
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        sx={{ marginLeft: 6, borderRadius: 100 }}
                                        onClick={handleNext}
                                    >
                                        ต่อไป
                                    </Button>
                                </Box>
                            </>
                        )}
                        {activeStep === 2 && (
                            <>
                                <Box textAlign="center">
                                    <ErrorIcon sx={{ color: '#ff0c34', fontSize: 180 }} />
                                </Box>

                                <Typography
                                    variant="h3"
                                    sx={{ fontWeight: 500, textAlign: 'center', marginTop: '10px', marginBottom: '20px', color: '#ff0c34' }}
                                >
                                    ยืนยันการส่งข้อมูล
                                </Typography>
                                <Box textAlign="center" sx={{ marginTop: '30px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleBack}>
                                        ย้อนกลับ
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="success"
                                        sx={{ marginLeft: 3, borderRadius: 100 }}
                                        onClick={handleSaveForm}
                                    >
                                        ยืนยัน
                                    </Button>
                                </Box>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

                <Dialog
                    fullWidth={true}
                    maxWidth={'sm'}
                    open={openCheck}
                    onClose={handleCloseCheck}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#086c3c' }}>
                        <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                            รายละเอียดการนำส่งอุปกรณ์-เครื่องมือการแพทย์
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Grid container sx={{ marginTop: 3, padding: '15px' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>ผู้ส่ง :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>
                                        {history.tracking_sender}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>รหัสชุด :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>{history.group_id}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>วันที่ส่ง :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>
                                        {moment(history.date_at).format('DD-MM-YYYY')}
                                        {/* 08-04-2023 */}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>อุปกรณ์ที่ส่ง :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>
                                        {showItem.map((item, key) => (
                                            <li style={{ fontSize: '16px' }} key={key}>
                                                {item.equipment_name} จำนวน: {item.equipment_quantity}
                                            </li>
                                        ))}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>สถานะ :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>
                                        {history.tracking_status}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>สถานะการอนุมัติ :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Stepper activeStep={activeStepTracking} orientation="vertical" sx={{ marginTop: 3 }}>
                                        {stepsTracking.map((step, index) => (
                                            <Step
                                                key={step.label}
                                                sx={{
                                                    '& .MuiStepLabel-root .Mui-completed': {
                                                        color: 'success.main' // circle color (COMPLETED)
                                                    },
                                                    '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
                                                        color: 'grey.500' // Just text label (COMPLETED)
                                                    },
                                                    '& .MuiStepLabel-root .Mui-active': {
                                                        color: 'success.main' // circle color (ACTIVE)
                                                    },
                                                    '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
                                                        color: 'common.white' // Just text label (ACTIVE)
                                                    },
                                                    '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                                                        fill: 'white' // circle's number (ACTIVE)
                                                    }
                                                }}
                                            >
                                                <StepLabel
                                                    style={{
                                                        color: index === activeStepTracking ? '#086c3c' : 'gray',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    {step.label}
                                                    {index == 1 ? (
                                                        <>
                                                            {history.tracking_recipient != null ? (
                                                                <>
                                                                    <br />
                                                                    <span style={{ color: 'red' }}>
                                                                        ผู้รับอุปกรณ์ : {history.tracking_recipient}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                            {history.tracking_meet_date != null ? (
                                                                <>
                                                                    <br />
                                                                    <span style={{ color: 'red' }}>
                                                                        วันนัดรับอุปกรณ์ :
                                                                        {moment(history.tracking_meet_date).format('DD-MM-YYYY')}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </>
                                                    ) : (
                                                        ''
                                                    )}
                                                    {activeStepTracking === 3 && index === 2 && (
                                                        <>
                                                            {history.tracking_sender != null ? (
                                                                <>
                                                                    <br />
                                                                    <span style={{ color: 'red' }}>
                                                                        ผู้รับอุปกรณ์ : {history.tracking_sender}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                            {history.tracking_meet_date != null ? (
                                                                <>
                                                                    <br />
                                                                    <span style={{ color: 'red' }}>
                                                                        วันรับอุปกรณ์ :
                                                                        {moment(history.tracking_meet_date).format('DD-MM-YYYY')}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </>
                                                    )}
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Grid>
                            </Grid>
                        </DialogContentText>

                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" onClick={handleCloseCheck}>
                                ออก
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Card>
        </div>
    );
};

export default Tracking;
