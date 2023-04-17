import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import axios from 'axios';
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
    IconButton
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
const Notification = () => {
    const [user, setUser] = useState();
    const [rows, setRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        setUser(JSON.parse(userData));
        getData(JSON.parse(userData));
    }, []);

    function getData(value) {
        const hospital = value.hospital_id;
        const role = value.role_status;
        axios
            .get(`http://localhost:7000/notification/${role}/${hospital}`)
            .then((response) => {
                const value = response.data.data;
                console.log(response);
                if (value) {
                    setRows(value.map((item, index) => createData(index + 1, item.notification_date, item.notification_detail)));
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const columns = [
        { id: 'order', label: 'ลำดับที่', maxWidth: 30 },
        { id: 'date', label: 'วันที่', maxWidth: 30 },
        { id: 'topic', label: 'รายละเอียด', minWidth: 100 }
    ];

    function createData(order, date, topic) {
        const formattedDate = moment(date).format('DD-MM-YYYY HH:mm:ss');
        return { order, date: formattedDate, topic };
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const readAll = () => {
        const hospital = user.hospital_id;
        const role = user.role_status;
        axios
            .put('http://localhost:7000/notification/read-all', {
                hospital: hospital,
                role: role
            })
            .then(function (response) {
                if (role == 1) {
                    window.location.reload();
                } else {
                    window.location.href = 'http://localhost:3000/report-documents';
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    return (
        <Card sx={{ minWidth: 275, minHeight: '100vh' }}>
            <div className="header-show-detail" style={{ backgroundColor: '#086c3c', padding: '15px' }}>
                <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                    การแจ้งเตือน
                </Typography>
            </div>
            <Button
                variant="outlined"
                onClick={readAll}
                sx={{ float: 'right', marginRight: '20px', marginTop: '20px', marginBottom: '20px' }}
                color="success"
                endIcon={<DoneAllIcon />}
            >
                อ่านทั้งหมด
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
        </Card>
    );
};

export default Notification;
