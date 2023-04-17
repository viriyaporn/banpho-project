import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment/moment';
import fileDownload from 'js-file-download';
import {
    TextField,
    Card,
    Button,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Box,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { FileDownload } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

const DocumentsApproveUser = () => {
    const [document, setDocument] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [open, setOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const [value, setValue] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [user, setUser] = useState([]);
    const [history, setHistory] = useState([]);
    const [openCheck, setOpenCheck] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [track, setTrack] = useState(null);
    const [data, getFile] = useState({ name: '', path: '' });
    const [checkFile, setCheckFile] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [filePath, setFilePath] = useState('');
    const [deleteId, setDeleteId] = useState('');
    const [editCode, setEditCode] = useState('');
    const [statusDoc, setStatusDoc] = useState('');
    const [approver, setApprover] = useState([]);
    const [disapprover, setDisApprover] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        setUser(JSON.parse(userData));
        console.log(JSON.parse(userData));
        getData(JSON.parse(userData));
    }, []);

    function getData(value) {
        const id = value.hospital_id;
        const status = 5; //สถานะเสร็จสิ้น
        axios
            .get(`http://localhost:7000/documents-status/${id}/${status}`)
            .then((response) => {
                console.log(response.data.data);
                let value = response.data.data;
                setRows(
                    value.map((item, index) =>
                        createData(
                            index + 1,
                            item.created_at,
                            item.document_code,
                            item.document_title,
                            item.created_by,
                            item.document_status
                        )
                    )
                );
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // Define steps for the stepper
    const [activeStepDoc, setActiveStepDoc] = useState(0);

    const stepsDocuments = [
        {
            label: 'ผู้อำนวยการโรงพยาบาล',
            description: ''
        },
        {
            label: 'เจ้าหน้าที่สาธารณสุขอำเภอบ้านโพธิ์',
            description: ''
        },
        {
            label: 'ผู้ช่วยสาธารณสุขอำเภอบ้านโพธิ์',
            description: ``
        },
        {
            label: 'สาธารณสุขอำเภอบ้านโพธิ์',
            description: ``
        }
    ];

    const handleDownloadFile = (event) => {
        event.preventDefault();
        console.log('event =>', event);
    };
    const columns = [
        { id: 'order', label: 'ลำดับที่', minWidth: 100 },
        { id: 'date', label: 'วันที่ส่ง', minWidth: 100 },
        { id: 'code', label: 'เลขที่เอกสาร', minWidth: 100 },
        { id: 'topic', label: 'หัวข้อ', minWidth: 100 },
        { id: 'reporter', label: 'ผู้ส่ง', minWidth: 100 },
        {
            id: 'status',
            label: 'สถานะ',
            minWidth: 100,
            render: (row) => {
                switch (row.status) {
                    case 0:
                        return 'รอการแก้ไข';
                    case 1:
                        return 'รอการตรวจสอบ(ผู้อำนวยการโรงพยาบาล)';
                    case 2:
                        return 'รอการตรวจสอบ(เจ้าหน้าที่สาธารณสุข)';
                    case 3:
                        return 'รอการตรวจสอบ(ผู้ช่วยสาธารณสุข)';
                    case 4:
                        return 'รอการตรวจสอบ(สาธารณสุขอำเภอบ้านโพธิ์)';
                    case 5:
                        return 'เสร็จสิ้น';
                    default:
                        return '';
                }
            }
        },
        {
            id: 'mange',
            label: 'การจัดการ',
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

    function createData(order, date, code, topic, reporter, status) {
        const formattedDate = `${moment(date).format('DD-MM-YYYY')}`;
        return { order, date: formattedDate, code, topic, reporter, status };
    }

    const handleSubmit = (event) => {
        event.preventDefault(); // prevent form submission
        const name = event.target.elements.name.value;
        const detail = event.target.elements.detail.value;
        const file = fileName;
        // ถ้ามีชื่ออุปกรณ์และจำนวนส่งมา
        if (name && file) {
            const newValue = { name, detail, file };
            setValue([...value, newValue]);
        }
        event.target.elements.name.value = '';
        event.target.elements.detail.value = '';
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleCheck = (row) => {
        setHistory(row);
        console.log('row =>', row);
        let status = row.status;
        setActiveStepDoc(status - 1);
        setStatusDoc(status);
        setOpenCheck(true);
        getDataDocument(row.code);
    };

    function getDataDocument(value) {
        const id = value;
        axios
            .get(`http://localhost:7000/document-detail/${id}`)
            .then((response) => {
                console.log('eiei', response.data.data[0]);
                let value = response.data.data[0];
                let code = value.document_code;
                let version = value.document_version;
                setDocument(value);
                getApprover(code, version);
                getDisapprove(code);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function getApprover(value, value1) {
        const code = value; //document_code
        const version = value1; //document_version
        axios
            .get(`http://localhost:7000/documents-get-approver/${code}/${version}`)
            .then((response) => {
                if (response) {
                    let value = response.data.data;
                    setApprover(value);
                    console.log('getApprover', response.data.data);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function getDisapprove(value) {
        const code = value;
        axios
            .get(`http://localhost:7000/documents-get-disapprover/${code}`)
            .then((response) => {
                if (response) {
                    let value = response.data.data;
                    setDisApprover(value);
                    console.log('getDisApprover', response.data.data);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const handleCloseCheck = () => {
        setOpenCheck(false);
        setStatusDoc(null);
    };

    function handleDownload(path) {
        const file_path = path;
        const download_url = `http://localhost:7000/download-file?file_path=${file_path}`;
        window.location.href = download_url;
    }

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
                        อนุมัติเรียบร้อย
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
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
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
                            รายละเอียดเอกสาร
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <Grid container sx={{ marginTop: 3, padding: '15px' }}>
                                <Grid item xs={12}>
                                    {document?.document_version > 1 ? (
                                        <>
                                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#ff0c34' }}>
                                                แก้ไขครั้งที่ : {document?.document_version - 1}
                                            </Typography>
                                            <br />
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </Grid>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>เลขที่เอกสาร :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>{history.code}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>ผู้ส่ง :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>{history.reporter}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>วันที่ส่ง :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>{history.date}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>ไฟล์เอกสาร :</Typography>
                                </Grid>
                                <Grid item container xs={9} alignItems="center">
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>
                                        {document?.document_file}
                                    </Typography>
                                    <IconButton
                                        aria-label="download"
                                        size="small"
                                        onClick={() => handleDownload(document?.document_file_path)}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>รายละเอียด :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>
                                        {document?.document_detail}
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                <Grid item xs={3}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: '500', color: '#000' }}>สถานะการอนุมัติ :</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Stepper activeStep={activeStepDoc} orientation="vertical" sx={{ marginTop: 3 }}>
                                        {stepsDocuments.map((step, index) => (
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
                                                <StepLabel>
                                                    <p style={{ fontSize: '16px' }}>{step.label}</p>
                                                    {activeStepDoc > index ? 'ผ่านการอนุมัติ' : ''}
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </Grid>
                            </Grid>

                            {activeStepDoc > 0 && (
                                <>
                                    <Grid container sx={{ padding: '15px' }}>
                                        <Grid item xs={3}>
                                            <Typography sx={{ fontSize: '15px', fontWeight: '600', color: '#086c3c' }}>
                                                ประวัติการอนุมัติ :
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            <Typography sx={{ fontSize: '16px', color: '#086c3c' }}>ผู้อำนวยการโรงพยาบาล</Typography>
                                            <Typography sx={{ fontSize: '14px', marginLeft: 4 }}>
                                                <span style={{ color: '#086c3c' }}>• ผ่านการอนุมัติ</span>
                                                <span style={{ marginLeft: '15px' }}>คุณ : {approver[0]?.approver_name}</span>
                                                <br />
                                                <span>
                                                    [{moment(approver[0]?.created_at).format('DD-MM-YYYY')} เวลา :{' '}
                                                    {moment(approver[0]?.created_at).format('HH:mm')}]
                                                </span>
                                            </Typography>
                                            {activeStepDoc > 1 && (
                                                <>
                                                    <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                        เจ้าหน้าที่สาธารณสุขอำเภอบ้านโพธิ์
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '14px', marginLeft: 4 }}>
                                                        <span style={{ color: '#086c3c' }}>• ผ่านการอนุมัติ</span>
                                                        <span style={{ marginLeft: '15px' }}>คุณ : {approver[1]?.approver_name}</span>
                                                        <br />
                                                        <span>
                                                            [{moment(approver[1]?.created_at).format('DD-MM-YYYY')} เวลา :{' '}
                                                            {moment(approver[1]?.created_at).format('HH:mm')}]
                                                        </span>
                                                    </Typography>
                                                </>
                                            )}

                                            {activeStepDoc > 2 && (
                                                <>
                                                    <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                        ผู้ช่วยสาธารณสุขอำเภอบ้านโพธิ์
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '14px', marginLeft: 4 }}>
                                                        <span style={{ color: '#086c3c' }}>• ผ่านการอนุมัติ</span>
                                                        <span style={{ marginLeft: '15px' }}>คุณ : {approver[2]?.approver_name}</span>
                                                        <br />
                                                        <span>
                                                            [{moment(approver[2]?.created_at).format('DD-MM-YYYY')} เวลา :{' '}
                                                            {moment(approver[2]?.created_at).format('HH:mm')}]
                                                        </span>
                                                    </Typography>
                                                </>
                                            )}

                                            {activeStepDoc > 3 && (
                                                <>
                                                    <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                        สาธารณสุขอำเภอบ้านโพธิ์
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '14px', marginLeft: 4 }}>
                                                        <span style={{ color: '#086c3c' }}>• ผ่านการอนุมัติ</span>
                                                        <span style={{ marginLeft: '15px' }}>คุณ : {approver[3]?.approver_name}</span>
                                                        <br />
                                                        <span>
                                                            [{moment(approver[3]?.created_at).format('DD-MM-YYYY')} เวลา :{' '}
                                                            {moment(approver[3]?.created_at).format('HH:mm')}]
                                                        </span>
                                                    </Typography>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                            {disapprover.length > 0 && (
                                <>
                                    <Grid container sx={{ padding: '15px', backgroundColor: '#f2f2f2' }}>
                                        <Grid item xs={3}>
                                            <Typography sx={{ fontSize: '15px', fontWeight: '600', color: '#ff0c34', marginTop: 2 }}>
                                                ประวัติการไม่อนุมัติ :
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            {disapprover.map((item) => (
                                                <>
                                                    {item.approver_id === 2 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                                ผู้อำนวยการโรงพยาบาล
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {item.approver_id === 3 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                                เจ้าหน้าที่สาธารณสุขอำเภอบ้านโพธิ์
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {item.approver_id === 4 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                                ผู้ช่วยสาธารณสุขอำเภอบ้านโพธิ์
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {item.approver_id === 5 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', marginTop: 2 }}>
                                                                สาธารณสุขอำเภอบ้านโพธิ์
                                                            </Typography>
                                                        </>
                                                    )}
                                                    <Typography sx={{ fontSize: '15px', marginLeft: 4 }}>
                                                        <span style={{ color: '#ff0c34' }}>• ไม่ผ่านการอนุมัติ</span>
                                                        <span style={{ marginLeft: '15px' }}>คุณ : {item?.approver_name}</span>
                                                        <br />
                                                        <span style={{ color: '#ff0c34', marginLeft: 1 }}>
                                                            • ข้อเสนอแนะ : {item?.approval_comments}
                                                        </span>
                                                        <br />
                                                        <span>
                                                            [{moment(item?.created_at).format('DD-MM-YYYY')} เวลา :
                                                            {moment(item?.created_at).format('HH:mm')}]
                                                        </span>
                                                    </Typography>{' '}
                                                </>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </>
                            )}
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

export default DocumentsApproveUser;
