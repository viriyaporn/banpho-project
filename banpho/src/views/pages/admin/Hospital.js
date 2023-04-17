import React, { useState, useEffect } from 'react';
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
    MenuItem,
    Select,
    SelectChangeEvent
} from '@mui/material';
import axios from 'axios';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import EditIcon from '@mui/icons-material/Edit';

const Hospital = () => {
    const [hospital, setHospital] = useState([]);
    const [rows, setRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [openCreate, setOpenCreate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        const name = event.target.elements.name.value;
        const address = event.target.elements.address.value;
        const phone = event.target.elements.phone.value;
        axios
            .post(`http://localhost:7000/hospital`, {
                name: name,
                address: address,
                phone: phone
            })
            .then(function (response) {
                getData();
                setOpenCreate(false);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const handleOpen = () => {
        setOpenCreate(true);
    };

    const handleClose = () => {
        setOpenCreate(false);
    };

    const handleOpenEdit = (row) => {
        const name = row.hospital;
        console.log(name);
        axios
            .get(`http://localhost:7000/hospital/${name}`)
            .then((response) => {
                const value = response?.data.data[0];
                console.log(value);
                setHospital(value);
            })
            .catch((error) => {
                console.error(error);
            });
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };

    const handleSubmitEdit = (event) => {
        event.preventDefault();
        const id = hospital?.hospital_id;
        const name = event.target.elements.name.value;
        const address = event.target.elements.address.value;
        const phone = event.target.elements.phone.value;
        axios
            .put(`http://localhost:7000/hospital/${id}`, {
                name: name,
                address: address,
                phone: phone
            })
            .then(function (response) {
                getData();
                setOpenEdit(false);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // Delete
    const handleOpenDelete = (row) => {
        const name = row.hospital;
        console.log(name);
        axios
            .get(`http://localhost:7000/hospital/${name}`)
            .then((response) => {
                const value = response?.data.data[0];
                console.log(value);
                setHospital(value);
                setOpenDelete(true);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleCloseDelete = () => {
        setOpenDelete(false);
    };

    const handleSubmitDelete = () => {
        const id = hospital?.hospital_id;
        axios
            .delete(`http://localhost:7000/hospital/${id}`)
            .then((response) => {
                getData();
                setOpenDelete(false);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        axios
            .get(`http://localhost:7000/hospital`)
            .then((response) => {
                const value = response?.data;
                console.log(value);
                setRows(value.map((item, index) => createData(index + 1, item.hospital_name, item.hospital_address, item.hospital_tel)));
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const columns = [
        { id: 'order', label: 'ลำดับที่', maxWidth: 30 },
        { id: 'hospital', label: 'โรงพยาบาล', minWidth: 100 },
        { id: 'address', label: 'ที่อยู่', minWidth: 100 },
        { id: 'phone', label: 'เบอร์ติดต่อ', minWidth: 100 },
        {
            id: 'mange',
            label: 'จัดการ',
            minWidth: 50,
            render: (row) => (
                <>
                    <IconButton aria-label="edit" onClick={() => handleOpenEdit(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="check" color="error" onClick={() => handleOpenDelete(row)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    function createData(order, hospital, address, phone) {
        return { order, hospital, address, phone };
    }

    return (
        <Card sx={{ minWidth: 275, minHeight: '100vh' }}>
            <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px' }}>
                จัดการโรงพยาบาล
            </Typography>
            <Button
                variant="outlined"
                onClick={handleOpen}
                sx={{ float: 'right', marginRight: '20px', marginTop: '20px', marginBottom: '20px' }}
                color="success"
                startIcon={<AddCircleIcon />}
            >
                เพิ่มโรงพยาบาล
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
                            {rows.map((row) => (
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
                open={openCreate}
                fullWidth={true}
                maxWidth={'sm'}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#086c3c' }}>
                    <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                        เพิ่มโรงพยาบาล
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <Typography sx={{ marginTop: 5, fontSize: '16px' }}>ชื่อโรงพยาบาล</Typography>
                        <TextField margin="dense" id="name" name="name" type="text" fullWidth variant="outlined" />
                        <Typography sx={{ marginTop: 2, fontSize: '16px' }}>ที่อยู่</Typography>
                        <TextField margin="dense" id="address" name="address" multiline rows={4} type="text" fullWidth variant="outlined" />
                        <Typography sx={{ marginTop: 2, fontSize: '16px' }}>เบอร์ติดต่อ</Typography>
                        <TextField margin="dense" id="phone" name="phone" type="text" fullWidth variant="outlined" />
                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" onClick={handleClose}>
                                ยกเลิก
                            </Button>
                            <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} type="submit">
                                ยืนยัน
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={openDelete}
                fullWidth={true}
                maxWidth={'sm'}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Box textAlign="center">
                            <ErrorIcon sx={{ color: '#ff0c34', fontSize: 180 }} />
                        </Box>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#ff0c34' }}
                        >
                            ยืนยันการลบข้อมูล
                        </Typography>
                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleCloseDelete}>
                                ย้อนกลับ
                            </Button>
                            <Button
                                variant="outlined"
                                color="success"
                                sx={{ marginLeft: 3, borderRadius: 100 }}
                                onClick={handleSubmitDelete}
                            >
                                ยืนยัน
                            </Button>
                        </Box>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            {/* แก้ไขข้อมูลโรงพยาบาล */}
            <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth={true} maxWidth={'sm'}>
                <DialogTitle sx={{ backgroundColor: '#086c3c' }}>
                    <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                        แบบฟอร์มการแก้ไขข้อมูล
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmitEdit}>
                        <Typography sx={{ marginTop: 5, fontSize: '16px' }}>ชื่อโรงพยาบาล</Typography>
                        <TextField
                            margin="dense"
                            id="name"
                            name="name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={hospital?.hospital_name}
                        />
                        <Typography sx={{ marginTop: 2, fontSize: '16px' }}>ที่อยู่</Typography>
                        <TextField margin="dense" id="address" name="address" multiline rows={4} type="text" fullWidth variant="outlined" />
                        <Typography sx={{ marginTop: 2, fontSize: '16px' }}>เบอร์ติดต่อ</Typography>
                        <TextField margin="dense" id="phone" name="phone" type="text" fullWidth variant="outlined" />
                        <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                            <Button variant="outlined" color="error" onClick={handleCloseEdit}>
                                ยกเลิก
                            </Button>
                            <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} type="submit">
                                ยืนยัน
                            </Button>
                        </Box>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default Hospital;
