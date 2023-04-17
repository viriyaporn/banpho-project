import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {
    Card,
    Typography,
    Button,
    Modal,
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
    MenuItem,
    InputAdornment
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';

const TrackingSuccess = () => {
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

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        const storage = JSON.parse(userData);
        console.log('storage =>', storage);
        setUser(storage);
        getData(storage);
    }, []);

    function getData(value) {
        const id = value.hospital_id;
        const status = 'เสร็จสิ้น';
        axios
            .get(`http://localhost:7000/tracking/${id}/${status}`)
            .then((response) => {
                const value = response.data.data;
                console.log(value);
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
                </>
            )
        }
    ];

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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseCheck = () => {
        setOpenCheck(false);
    };

    const handleEquipmentChange = (event) => {
        const value = event.target.value;
        setSelectedEquipment(value);
    };

    const filteredRows = rows.filter((row) => {
        return Object.values(row).some((value) => {
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
    });

    return (
        <div>
            <Card sx={{ minWidth: 275, minHeight: '100vh' }}>
                <div className="header-show-detal" style={{ backgroundColor: '#086c3c', padding: '15px' }}>
                    <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                        รับอุปกรณ์คืนเรียบร้อย
                    </Typography>
                </div>
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 20, marginTop: 3 }}>
                    <Typography sx={{ fontWeight: 500 }}>ค้นหา</Typography>
                    <TextField
                        margin="dense"
                        id="search"
                        name="search"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ marginLeft: 3, width: '75%' }}
                    />
                </Box>
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
                    {/* แสดงตาราง */}
                    <TableContainer>
                        <Table>
                            {/* หัวข้อ Column */}
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell key={column.id} align="center" style={{ minWidth: column.minWidth }}>
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            {/* เนื้อหาภายใน */}
                            <TableBody>
                                {filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.order}>
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
                                                {item.equipment_name} จำนวน : {item.equipment_quantity}
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

export default TrackingSuccess;
