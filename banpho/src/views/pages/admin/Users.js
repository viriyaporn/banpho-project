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

const Users = () => {
    const [id, setId] = useState();
    const [role, setRole] = useState();
    const [hospital, setHospital] = useState([]);
    const [listHospital, setListHospital] = useState();
    const [rows, setRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const handleOpen = () => {
        setOpenCreate(true);
    };

    const handleClose = () => {
        setOpenCreate(false);
    };

    const handleChange = (event) => {
        setHospital(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const username = event.target.elements.username.value;
        const password = event.target.elements.password.value;
        const firstname = event.target.elements.firstname.value;
        const lastname = event.target.elements.lastname.value;
        const role_status = event.target.elements.role.value;
        const hospital_id = event.target.elements.hospital.value;

        axios
            .post(`http://localhost:7000/user`, {
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname,
                role: role_status,
                hospital: hospital_id
            })
            .then(function (response) {
                getData();
                setOpenCreate(false);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const changeRole = (event) => {
        console.log(event.target.value);
        setRole(event.target.value);
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
        console.log(row);
        setId(row.id);
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
    };
    const handleSubmitEdit = (event) => {
        event.preventDefault();
        const firstname = event.target.elements.firstname.value;
        const lastname = event.target.elements.lastname.value;
        const role_status = event.target.elements.role.value;
        const hospital_id = event.target.elements.hospital.value;
        axios
            .put(`http://localhost:7000/user/${id}`, {
                firstname: firstname,
                lastname: lastname,
                role: role_status,
                hospital: hospital_id
            })
            .then(function (response) {
                getData();
                setOpenEdit(false);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    // Delete
    const handleOpenDelete = (row) => {
        setId(row.id);
        setOpenDelete(true);
    };

    const handleCloseDelete = () => {
        setId(null);
        setOpenDelete(false);
    };

    const handleSubmitDelete = () => {
        axios
            .delete(`http://localhost:7000/users/${id}`)
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
        getHospital();
    }, []);

    const getData = () => {
        axios
            .get(`http://localhost:7000/users`)
            .then((response) => {
                const value = response?.data;
                setRows(
                    value.map((item, index) =>
                        createData(
                            index + 1,
                            item.user_id,
                            item.user_firstname + ' ' + item.user_lastname,
                            item.user_position,
                            item.user_place
                        )
                    )
                );
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const getHospital = () => {
        axios
            .get(`http://localhost:7000/hospital-list`)
            .then((response) => {
                const value = response?.data.data;
                console.log(value);
                setListHospital(value);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const columns = [
        { id: 'order', label: 'ลำดับ', minWidth: 30 },
        { id: 'id', label: 'ไอดี', minWidth: 30 },
        { id: 'name', label: 'ชื่อ-นามสกุล', minWidth: 100 },
        { id: 'role', label: 'ตำแหน่ง', minWidth: 100 },
        { id: 'hospital', label: 'โรงพยาบาล', minWidth: 100 },
        {
            id: 'mange',
            label: 'จัดการ',
            minWidth: 50,
            render: (row) => (
                <>
                    <IconButton aria-label="edit" onClick={() => handleOpenEdit(row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" color="error" onClick={() => handleOpenDelete(row)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    function createData(order, id, name, role, hospital) {
        return { order, id, name, role, hospital };
    }

    return (
        <Card sx={{ minWidth: 275, minHeight: '100vh' }}>
            <div className="header-show-detail" style={{ backgroundColor: '#086c3c', padding: '15px' }}>
                <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                    จัดการสมาชิก
                </Typography>
            </div>
            <Button
                variant="outlined"
                onClick={handleOpen}
                sx={{ float: 'right', marginRight: '20px', marginTop: '20px', marginBottom: '20px' }}
                color="success"
                startIcon={<AddCircleIcon />}
            >
                เพิ่มสมาชิก
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
                        เพิ่มสมาชิก
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <form onSubmit={handleSubmit}>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>ชื่อสมาชิก</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <TextField id="username" name="username" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>รหัสผ่าน</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <TextField id="password" name="password" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>ชื่อ</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <TextField id="firstname" name="firstname" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>นามสกุล</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <TextField id="lastname" name="lastname" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>ตำแหน่ง</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <Select id="role" name="role" value={role} onChange={changeRole} fullWidth>
                                        <MenuItem value={1}>เจ้าหน้าที่โรงพยาบาล</MenuItem>
                                        <MenuItem value={2}>ผู้อำนวยการโรงพยาบาล</MenuItem>
                                        <MenuItem value={3}>เจ้าหน้าที่สาธารณสุข</MenuItem>
                                        <MenuItem value={4}>ผู้ช่วยสาธารณสุข</MenuItem>
                                        <MenuItem value={5}>ผู้อำนวยการสาธารณสุข</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                            {role === 1 || role === 2 ? (
                                <>
                                    <Grid container sx={{ marginTop: 5 }}>
                                        <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                            <Typography sx={{ fontSize: '18px' }}>โรงพยาบาล</Typography>
                                        </Grid>
                                        <Grid xs={9}>
                                            <Select id="hospital" name="hospital" value={hospital} onChange={handleChange} fullWidth>
                                                {listHospital.map((item, key) => (
                                                    <MenuItem value={item.hospital_id}>{item.hospital_name}</MenuItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                    </Grid>
                                </>
                            ) : (
                                ''
                            )}
                            <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                <Button variant="outlined" color="error" onClick={handleClose}>
                                    ยกเลิก
                                </Button>
                                <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} type="submit">
                                    ยืนยัน
                                </Button>
                            </Box>
                        </form>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            {/* แก้ไขผู้ใช้งาน */}
            <Dialog
                open={openEdit}
                fullWidth={true}
                maxWidth={'sm'}
                onClose={handleCloseEdit}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#086c3c' }}>
                    <Typography variant="h3" sx={{ fontWeight: 500, color: '#fff' }}>
                        แก้ไขสมาชิก
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <form onSubmit={handleSubmitEdit}>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>ชื่อ</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <TextField id="firstname" name="firstname" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>นามสกุล</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <TextField id="lastname" name="lastname" fullWidth variant="outlined" />
                                </Grid>
                            </Grid>
                            <Grid container sx={{ marginTop: 5 }}>
                                <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '18px' }}>ตำแหน่ง</Typography>
                                </Grid>
                                <Grid xs={9}>
                                    <Select id="role" name="role" value={role} onChange={changeRole} fullWidth>
                                        <MenuItem value={1}>เจ้าหน้าที่โรงพยาบาล</MenuItem>
                                        <MenuItem value={2}>ผู้อำนวยการโรงพยาบาล</MenuItem>
                                        <MenuItem value={3}>เจ้าหน้าที่สาธารณสุข</MenuItem>
                                        <MenuItem value={4}>ผู้ช่วยสาธารณสุข</MenuItem>
                                        <MenuItem value={5}>ผู้อำนวยการสาธารณสุข</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                            {role === 1 || role === 2 ? (
                                <>
                                    <Grid container sx={{ marginTop: 5 }}>
                                        <Grid xs={3} sx={{ alignSelf: 'center' }}>
                                            <Typography sx={{ fontSize: '18px' }}>โรงพยาบาล</Typography>
                                        </Grid>
                                        <Grid xs={9}>
                                            <Select id="hospital" name="hospital" value={hospital} onChange={handleChange} fullWidth>
                                                {listHospital.map((item, key) => (
                                                    <MenuItem value={item.hospital_id}>{item.hospital_name}</MenuItem>
                                                ))}
                                            </Select>
                                        </Grid>
                                    </Grid>
                                </>
                            ) : (
                                ''
                            )}
                            <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                <Button variant="outlined" color="error" onClick={handleCloseEdit}>
                                    ยกเลิก
                                </Button>
                                <Button variant="outlined" color="success" sx={{ marginLeft: 3 }} type="submit">
                                    ยืนยัน
                                </Button>
                            </Box>
                        </form>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            {/* ลบข้อมูลผู้ใช้ */}
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
        </Card>
    );
};

export default Users;
