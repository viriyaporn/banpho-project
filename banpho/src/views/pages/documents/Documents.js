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
    StepContent,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { FileDownload } from '@mui/icons-material';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import MUIDataTable from 'mui-datatables';

const Documents = () => {
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
    const [version, setVersion] = useState(1);
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
        axios
            .get(`http://localhost:7000/documents-wait/${id}`)
            .then((response) => {
                console.log(response.data.data); // ข้อมูลเอกสาร
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
            label: 'ผู้อำนวยการโรงพยาบาล'
        },
        {
            label: 'เจ้าหน้าที่สาธารณสุขอำเภอบ้านโพธิ์'
        },
        {
            label: 'ผู้ช่วยสาธารณสุขอำเภอบ้านโพธิ์'
        },
        {
            label: 'สาธารณสุขอำเภอบ้านโพธิ์'
        }
    ];

    const handleNextDoc = () => {
        setActiveStepDoc((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBacktDoc = () => {
        setActiveStepDoc((prevActiveStep) => prevActiveStep - 1);
    };

    const handleResetDoc = () => {
        setActiveStepDoc(0);
    };

    // เปิด Dialog การลบ
    const handleDeleteDocument = (row) => {
        setOpenDelete(true);
        console.log('row =>', row);
        setDeleteId(row.code);
    };
    // ยืนยันการลบ
    const handleDelete = () => {
        let id = deleteId;
        axios
            .delete(`http://localhost:7000/document/${id}`)
            .then((response) => {
                setDeleteId(null);
                setOpenDelete(false);
                getData(user);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    // ปิด Dialog การลบ
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setDeleteId(null);
    };
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
                    {/* แก้ไขเมื่อstatus = 0, ลบเมื่อstatus = 1 */}
                    <IconButton aria-label="check" onClick={() => handleCheck(row)}>
                        <VisibilityRoundedIcon />
                    </IconButton>
                    <IconButton aria-label="edit" onClick={() => handleOpenEdit(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" color="error" size="small" onClick={() => handleDeleteDocument(row)}>
                        <DeleteIcon />
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
        // setFile(null);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };
    // Edit
    const handleOpenEdit = (row) => {
        console.log('row', row);
        let code = row.code;
        setEditCode(code);
        setOpenEdit(true);
    };
    const handleCloseEdit = () => {
        setOpenEdit(false);
        setEditCode(null);
    };
    const handleSubmitEdit = (event) => {
        event.preventDefault(); // prevent form submission
        const code = editCode;
        const name = event.target.elements.name.value;
        const detail = event.target.elements.detail.value;
        const file = fileName;
        // ถ้ามีชื่ออุปกรณ์และจำนวนส่งมา
        if (name && file) {
            const newValue = { code, name, detail, file };
            setValue([...value, newValue]);
        }
        event.target.elements.name.value = '';
        event.target.elements.detail.value = '';
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    const handleEdit = (row) => {
        // Implement the edit logic
    };

    const handleSaveFormEdit = () => {
        let id = editCode; // เลข Track ที่นำมา Update
        axios
            .put(`http://localhost:7000/document/${id}`, {
                title: value[0].name,
                detail: value[0].detail,
                file: fileName,
                filePath: filePath,
                name: user.user_firstname + ' ' + user.user_lastname,
                hospital: user.hospital_id,
                user_id: user.user_id
            })
            .then(function (response) {
                const value = response.data;
                getData(user);
            })
            .catch(function (error) {
                console.log(error);
            });
        setOpenEdit(false);
        setEditCode(null);
        setActiveStep(0);
        setValue([]);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setFile(null);
        setFileName(null);
        setFilePath(null);
        setValue([]);
        setOpen(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFile(file);
    };

    const uploadFile = async (e) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', fileName);
        try {
            const res = await axios.post('http://localhost:7000/upload', formData);
            console.log(res);
            setFileName(res.data.name);
            setFilePath(res.data.path);
            setCheckFile(true);
        } catch (err) {
            console.log(err);
        }
    };

    function handleDownload(path) {
        const file_path = path;
        const download_url = `http://localhost:7000/download-file?file_path=${file_path}`;
        window.location.href = download_url;
    }

    const handleNext = (event) => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = (event) => {
        setFile(null);
        setFileName(null);
        setValue([]);
        setOpen(false);
    };

    const handleSaveForm = () => {
        let track = `DOC-${user.hospital_id}${moment().format('YYYYMMDDHHmmss')}`;
        axios
            .post('http://localhost:7000/document', {
                code: track,
                title: value[0].name,
                detail: value[0].detail,
                file: fileName,
                filePath: filePath,
                name: user.user_firstname + ' ' + user.user_lastname,
                hospital: user.hospital_id,
                user_id: user.user_id
            })
            .then(function (response) {
                const value = response.data;
                getData(user);
            })
            .catch(function (error) {
                console.log(error);
            });
        setOpen(false);
        setActiveStep(0);
        setValue([]);
    };

    const handleCheck = (row) => {
        setHistory(row);
        console.log('row =>', row);
        let status = row.status;
        console.log(row.code);
        getDataDocument(row.code);
        setActiveStepDoc(status - 1);
        setStatusDoc(status);
        setOpenCheck(true);
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

    // แสดงการอนุมัติเอกสาร
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

    // แสดงรายละเอียดการไม่อนุมัติเอกสาร
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
        setDocument(null);
        setStatusDoc(null);
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
                        รอการอนุมัติ
                    </Typography>
                </div>
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 5, marginTop: 3 }}>
                    <Typography sx={{ fontWeight: 500 }}>ค้นหา</Typography>
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
                <Button
                    variant="outlined"
                    onClick={handleClickOpen} // setOpen(true)
                    sx={{ float: 'right', marginRight: 5 }}
                    color="success"
                    startIcon={<AddCircleIcon />}
                >
                    เพิ่มรายงาน
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
                    {/* แสดงตาราง sx={{ maxHeight: 440 }} */}
                    <TableContainer>
                        {/*stickyHeader aria-label="sticky table"*/}
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
                    {/* ตัวจัดการหน้าของตาราง */}
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
                {/* กดสร้างเอกสาร */}
                <Dialog maxWidth={'sm'} fullWidth={true} open={open} onClose={handleClose}>
                    <DialogTitle sx={{ backgroundColor: '#086c3c' }}>
                        <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                            แบบฟอร์มการส่งเอกสาร
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {activeStep === 0 && (
                            <form onSubmit={handleSubmit}>
                                <Typography sx={{ marginTop: 5, fontSize: '16px' }}>ชื่อหัวข้อ</Typography>
                                <TextField
                                    margin="dense"
                                    id="name"
                                    name="name"
                                    placeholder="ระบุหัวข้อของเอกสาร"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                />
                                <Typography sx={{ marginTop: 3, fontSize: '16px', display: 'inline-block' }}>
                                    รายละเอียด{' '}
                                    <Typography sx={{ color: '#ff0c34', fontSize: '16px', display: 'inline-block' }}>(*ถ้ามี)</Typography>
                                </Typography>

                                <TextField
                                    margin="dense"
                                    id="detail"
                                    name="detail"
                                    placeholder="ระบุรายละเอียด"
                                    multiline
                                    rows={4}
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    sx={{ marginTop: 2 }}
                                />
                                <p>
                                    แนบไฟล์เอกสาร:
                                    {file ? <span> {file.name}</span> : <span> No file selected</span>}
                                    {file ? (
                                        ''
                                    ) : (
                                        <Button variant="contained" component="label" sx={{ marginLeft: '20px' }}>
                                            เลือกไฟล์เอกสาร
                                            <input type="file" id="file" name="file" hidden onChange={handleFileChange} />
                                        </Button>
                                    )}
                                    {file ? (
                                        <Button variant="contained" component="label" sx={{ marginLeft: '20px' }} onClick={uploadFile}>
                                            อัพโหลดไฟล์เอกสาร
                                        </Button>
                                    ) : (
                                        ''
                                    )}
                                </p>
                                {equipment.length > 0 ? (
                                    <>
                                        <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                            รายการทั้งหมด
                                        </Typography>
                                        <ol>
                                            {equipment.map((item, key) => (
                                                <li key={key}>
                                                    {item.name} จำนวน : {item.detail} file : {item.file}
                                                    <IconButton onClick={() => handleDeleteDocument(key)} color="error" size="small">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </li>
                                            ))}
                                        </ol>
                                    </>
                                ) : (
                                    ''
                                )}
                                {checkFile ? (
                                    <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                        <Button variant="outlined" color="error" onClick={handleClose}>
                                            ยกเลิก
                                        </Button>
                                        <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} type="submit">
                                            ต่อไป
                                        </Button>
                                    </Box>
                                ) : (
                                    ''
                                )}
                            </form>
                        )}
                        {activeStep === 1 && (
                            <>
                                {value.map((item, key) => (
                                    <div key={key}>
                                        <Grid container>
                                            <Grid xs={3}>
                                                <Typography sx={{ fontWeight: 700, marginTop: '20px', fontSize: '16px' }}>
                                                    ชื่อหัวข้อ :
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '20px', fontSize: '16px' }}>{item.name}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container>
                                            <Grid xs={3}>
                                                <Typography
                                                    sx={{ marginTop: 3, fontSize: '16px', display: 'inline-block', fontWeight: 700 }}
                                                >
                                                    รายละเอียด{' '}
                                                    <Typography
                                                        sx={{
                                                            color: '#ff0c34',
                                                            fontSize: '16px',
                                                            display: 'inline-block',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        (*ถ้ามี) :
                                                    </Typography>
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '25px', fontSize: '16px' }}>{item.detail}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container>
                                            <Grid xs={3}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '16px', marginTop: '20px' }}>
                                                    แนบไฟล์เอกสาร :
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '20px', fontSize: '16px', textDecoration: 'underline' }}>
                                                    {item.file}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </div>
                                ))}
                                <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" onClick={handleClose}>
                                        ยกเลิก
                                    </Button>
                                    <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} onClick={handleNext}>
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
                                    sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#ff0c34' }}
                                >
                                    ยืนยันการส่งข้อมูลเอกสาร
                                </Typography>
                                <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" onClick={handleClose}>
                                        ยกเลิก
                                    </Button>
                                    <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} onClick={handleSaveForm}>
                                        ยืนยัน
                                    </Button>
                                </Box>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
                {/* กดดวงตาตรวจสอบข้อมูลของเอกสาร */}
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
                                                    {activeStepDoc == index ? 'รอการอนุมัติ' : ''}
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
                                            <Typography sx={{ fontSize: '16px', fontWeight: '600', color: '#086c3c' }}>
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
                                                        <span style={{ color: '#086c3c', marginLeft: 4 }}>• ผ่านการอนุมัติ</span>
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
                                                    <Typography>
                                                        <span style={{ color: '#086c3c', marginLeft: 4 }}>• ผ่านการอนุมัติ</span>
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
                                    <Grid container sx={{ padding: '15px' }}>
                                        <Grid item xs={3}>
                                            <Typography sx={{ fontSize: '14px', fontWeight: '600', color: '#ff0c34', magintop: 2 }}>
                                                ประวัติการไม่อนุมัติ :
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={9}>
                                            {disapprover.map((item, key) => (
                                                <>
                                                    {item.approver_id === 2 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', magintop: 2 }}>
                                                                ผู้อำนวยการโรงพยาบาล
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {item.approver_id === 3 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', magintop: 2 }}>
                                                                เจ้าหน้าที่สาธารณสุขอำเภอบ้านโพธิ์
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {item.approver_id === 4 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', magintop: 2 }}>
                                                                ผู้ช่วยสาธารณสุขอำเภอบ้านโพธิ์
                                                            </Typography>
                                                        </>
                                                    )}
                                                    {item.approver_id === 5 && (
                                                        <>
                                                            <Typography sx={{ fontSize: '16px', color: '#086c3c', magintop: 2 }}>
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
                {/* ลบเอกสาร */}
                <Dialog open={openDelete} fullWidth={true} maxWidth={'sm'}>
                    <DialogTitle>
                        <Typography variant="h3" sx={{ fontWeight: 500, color: 'red', textAlign: 'center' }}>
                            ยืนยันการลบเอกสาร
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <Box textAlign="center">
                            <ErrorIcon sx={{ color: '#ff0c34', fontSize: 180 }} />
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#ff0c34' }}
                        >
                            เมื่อลบเอกสารแล้ว ไม่สามารถเรียกคืนได้
                        </Typography>
                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleCloseDelete}>
                                ย้อนกลับ
                            </Button>
                            <Button variant="outlined" color="success" sx={{ marginLeft: 3, borderRadius: 100 }} onClick={handleDelete}>
                                ยืนยัน
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {/* การแก้ไขเอกสาร */}
                {/* การแก้ไขเอกสาร */}
                <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth={true} maxWidth={'sm'}>
                    <DialogTitle sx={{ backgroundColor: '#086c3c' }}>
                        <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                            แบบฟอร์มการแก้ไขเอกสาร
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {activeStep === 0 && (
                            <form onSubmit={handleSubmit}>
                                {/* editCode */}
                                <Typography sx={{ marginTop: 3, fontSize: '16px', fontWeight: 600 }}>รหัสเอกสาร {editCode}</Typography>
                                <Typography sx={{ marginTop: 3, fontSize: '16px' }}>ชื่อหัวข้อ :</Typography>
                                <TextField
                                    margin="dense"
                                    id="name"
                                    name="name"
                                    placeholder="ระบุหัวข้อของเอกสาร"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                />
                                <Typography sx={{ marginTop: 3, fontSize: '16px', display: 'inline-block' }}>
                                    รายละเอียด{' '}
                                    <Typography sx={{ color: '#ff0c34', fontSize: '16px', display: 'inline-block' }}>(*ถ้ามี) :</Typography>
                                </Typography>

                                <TextField
                                    margin="dense"
                                    id="detail"
                                    name="detail"
                                    placeholder="ระบุรายละเอียด"
                                    multiline
                                    rows={4}
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    sx={{ marginTop: 2 }}
                                />
                                <p>
                                    แนบไฟล์เอกสาร:
                                    {file ? <span> {file.name}</span> : <span> No file selected</span>}
                                    {file ? (
                                        ''
                                    ) : (
                                        <Button variant="contained" component="label" sx={{ marginLeft: '20px' }}>
                                            เลือกไฟล์เอกสาร
                                            <input type="file" id="file" name="file" hidden onChange={handleFileChange} />
                                        </Button>
                                    )}
                                    {file ? (
                                        <Button variant="contained" component="label" sx={{ marginLeft: '20px' }} onClick={uploadFile}>
                                            อัพโหลดไฟล์เอกสาร
                                        </Button>
                                    ) : (
                                        ''
                                    )}
                                </p>
                                {checkFile ? (
                                    <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                        <Button variant="outlined" color="error" onClick={handleClose}>
                                            ยกเลิก
                                        </Button>
                                        <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} type="submit">
                                            ต่อไป
                                        </Button>
                                    </Box>
                                ) : (
                                    ''
                                )}
                            </form>
                        )}
                        {activeStep === 1 && (
                            <>
                                {value.map((item, key) => (
                                    <div key={key}>
                                        <Grid container>
                                            <Grid xs={3}>
                                                <Typography sx={{ fontWeight: 700, marginTop: '20px', fontSize: '16px' }}>
                                                    รหัสเอกสาร :
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '20px', fontSize: '16px' }}>{editCode}</Typography>
                                            </Grid>
                                            <Grid xs={3}>
                                                <Typography sx={{ fontWeight: 700, marginTop: '20px', fontSize: '16px' }}>
                                                    ชื่อหัวข้อ :
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '20px', fontSize: '16px' }}>{item.name}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container>
                                            <Grid xs={3}>
                                                <Typography
                                                    sx={{ marginTop: 3, fontSize: '16px', display: 'inline-block', fontWeight: 700 }}
                                                >
                                                    รายละเอียด{' '}
                                                    <Typography
                                                        sx={{
                                                            color: '#ff0c34',
                                                            fontSize: '16px',
                                                            display: 'inline-block',
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        (*ถ้ามี) :
                                                    </Typography>
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '20px', fontSize: '16px' }}>{item.detail}</Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid container>
                                            <Grid xs={3}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '16px', marginTop: '20px' }}>
                                                    แนบไฟล์เอกสาร :
                                                </Typography>
                                            </Grid>
                                            <Grid xs={9}>
                                                <Typography sx={{ marginTop: '20px', fontSize: '16px', textDecoration: 'underline' }}>
                                                    {item.file}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </div>
                                ))}
                                <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" onClick={handleClose}>
                                        ยกเลิก
                                    </Button>
                                    <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} onClick={handleNext}>
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
                                    sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#ff0c34' }}
                                >
                                    ยืนยันการส่งข้อมูลแก้ไขเอกสาร
                                </Typography>
                                <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                    <Button variant="outlined" color="error" onClick={handleClose}>
                                        ยกเลิก
                                    </Button>
                                    <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} onClick={handleSaveFormEdit}>
                                        ยืนยัน
                                    </Button>
                                </Box>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </Card>
        </div>
    );
};

export default Documents;
