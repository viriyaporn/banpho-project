import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment/moment';
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
import EditIcon from '@mui/icons-material/Edit';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import UnpublishedRoundedIcon from '@mui/icons-material/UnpublishedRounded';
import DownloadIcon from '@mui/icons-material/Download';
import ErrorIcon from '@mui/icons-material/Error';

const DocumentsWaiting = () => {
    const [user, setUser] = useState();
    const [document, setDocument] = useState([]);
    const [rows, setRows] = useState([]);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [open, setOpen] = useState(false);
    const [openApprove, setOpenApprove] = useState(false);
    const [openDisapprove, setOpenDisapprove] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        console.log(JSON.parse(userData));
        setUser(JSON.parse(userData));
        getData(JSON.parse(userData));
    }, []);

    function getData(value) {
        const id = value.hospital_id;
        const getrole = value.user_role;
        console.log('getrole', getrole);
        let status = 0;
        if (getrole === 'director hospital') {
            status = 1;
        } else if (getrole === 'officer') {
            status = 2;
        } else if (getrole === 'assistant') {
            status = 3;
        } else if (getrole === 'director') {
            status = 4;
        }
        axios
            .get(`http://localhost:7000/documents-status/${id}/${status}`)
            .then((response) => {
                console.log(response.data.data);
                const value = response.data.data;
                setRows(
                    value.map((item, index) =>
                        createData(
                            index + 1,
                            item.created_at,
                            item.document_code,
                            item.document_title,
                            item.document_file,
                            item.created_by,
                            item.hospital_name,
                            item.hospital_id,
                            item.document_detail,
                            item.document_file_path
                        )
                    )
                );
                // Rest of the code
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const columns = [
        { id: 'order', label: 'ลำดับที่', minWidth: 100 },
        { id: 'date', label: 'วันที่ส่ง', minWidth: 100 },
        { id: 'code', label: 'รหัส', minWidth: 100 },
        { id: 'topic', label: 'หัวข้อ', minWidth: 100 },
        { id: 'document', label: 'เอกสาร', minWidth: 100 },
        { id: 'reporter', label: 'ผู้รายงาน', minWidth: 100 },
        { id: 'hospital', label: 'โรงพยาบาล', minWidth: 100 },
        { id: 'detail', label: 'หมายเหตุ', minWidth: 100 },
        {
            id: 'actions',
            label: 'สถานะ',
            minWidth: 100,
            render: (row) => (
                <>
                    <IconButton aria-label="approve" color="success" onClick={() => handleClickOpenApprove(row)}>
                        <CheckCircleRoundedIcon />
                    </IconButton>
                    <IconButton aria-label="disapprove" color="error" onClick={() => handleClickOpenDisapprove(row)}>
                        <UnpublishedRoundedIcon />
                    </IconButton>
                </>
            )
        },
        {
            id: 'file',
            label: 'ไฟล์',
            minWidth: 100,
            render: (row) => (
                <>
                    <IconButton aria-label="approve" onClick={() => handleDownload(row.path)}>
                        <DownloadIcon />
                    </IconButton>
                </>
            )
        }
    ];

    function createData(order, date, code, topic, document, reporter, hospital, hospitalId, detail, path) {
        const formattedDate = moment(date).format('DD-MM-YYYY');
        return { order, date: formattedDate, code, topic, document, reporter, hospital, hospitalId, detail, path };
    }

    const handleClickOpenApprove = (row) => {
        setDocument(row);
        setOpenApprove(true);
    };

    const handleCloseApprove = (row) => {
        setDocument([]);
        setOpenApprove(false);
    };

    const handleClickOpenDisapprove = (row) => {
        console.log(row);
        setDocument(row);
        setOpenDisapprove(true);
    };

    const handleCloseDisapprove = (row) => {
        setDocument([]);
        setOpenDisapprove(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDisapprove = (event) => {
        event.preventDefault(); // prevent form submission
        const comment = event.target.form.comment.value;
        const id = document.code;
        console.log(id);
        console.log(document.hospital);

        axios
            .post(`http://localhost:7000/disapprove/${id}`, {
                role: user.role_status,
                comment: comment,
                hospital: user.hospital_id,
                hospital_owner: document?.hospitalId,
                approver: user.user_firstname + ' ' + user.user_lastname
            })
            .then(function (response) {
                const value = response.data;
                if (value.status == 'ok') {
                    getData(user);
                    setOpenDisapprove(false);
                    console.log('update status success');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    const handleApprove = (event) => {
        event.preventDefault(); // prevent form submission
        const id = document.code;
        axios
            .post(`http://localhost:7000/approve/${id}`, {
                role: user.role_status,
                comment: null,
                hospital: user.hospital_id,
                approver: user.user_firstname + ' ' + user.user_lastname
            })
            .then(function (response) {
                console.log(response);
                const value = response.data;
                if (value.status == 'ok') {
                    getData(user);
                    setOpenApprove(false);
                    console.log('update status success');
                }
            })
            .catch(function (error) {
                console.log(error);
            });
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
                <div className="headrt-show-detail" style={{ backgroundColor: '#086c3c', padding: '15px' }}>
                    <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                        รอการอนุมัติ
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

                {/* Approve */}
                <Dialog open={openApprove} fullWidth={true} maxWidth={'xs'} onClose={handleCloseApprove}>
                    {/* <DialogTitle sx={{ backgroundColor: '#086c3c' }}>
                        <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                            อนุมัติเอกสาร
                        </Typography>
                    </DialogTitle> */}
                    <form onSubmit={handleApprove}>
                        <DialogContent>
                            {/* <DialogContentText sx={{ marginBottom: '20px' }}>ข้อเสนอของคุณ</DialogContentText>
                            <TextField
                                margin="dense"
                                id="comment"
                                name="comment"
                                label="กรอกรายละเอียดเพิ่มเติม"
                                type="text"
                                multiline
                                rows={4}
                                fullWidth
                                variant="outlined"
                                disabled
                            /> */}

                            <Box textAlign="center">
                                <ErrorIcon sx={{ color: '#086c3c', fontSize: 180 }} />
                            </Box>

                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 500, textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: '#086c3c' }}
                            >
                                อนุมัติเอกสาร
                            </Typography>
                            <Box textAlign="center" sx={{ marginTop: '20px', marginBottom: '20px' }}>
                                <Button variant="outlined" color="error" sx={{ borderRadius: 100 }} onClick={handleCloseApprove}>
                                    ย้อนกลับ
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    sx={{ marginLeft: 3, borderRadius: 100 }}
                                    onClick={handleApprove}
                                >
                                    ยืนยัน
                                </Button>
                            </Box>
                        </DialogContent>
                        {/* <DialogActions>
                            <Button onClick={handleCloseApprove}>ยกเลิก</Button>
                            <Button onClick={handleApprove} type="submit">
                                ยืนยัน
                            </Button>
                        </DialogActions> */}
                    </form>
                </Dialog>

                {/* Disapprove */}
                <Dialog open={openDisapprove} fullWidth={true} maxWidth={'sm'}>
                    <DialogTitle sx={{ backgroundColor: '#ff0c34' }}>
                        <Typography variant="h3" sx={{ fontWeight: 500, textAlign: 'center', color: '#fff' }}>
                            ไม่อนุมัติเอกสาร
                        </Typography>
                    </DialogTitle>
                    <form onSubmit={handleDisapprove}>
                        <DialogContent>
                            <Typography sx={{ fontSize: '18px' }}>ข้อเสนอของคุณ</Typography>
                            <TextField
                                margin="dense"
                                id="comment"
                                name="comment"
                                label="กรอกรายละเอียดเพิ่มเติม"
                                type="text"
                                multiline
                                rows={4}
                                fullWidth
                                variant="outlined"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDisapprove}>ยกเลิก</Button>
                            <Button onClick={handleDisapprove} type="submit">
                                ยืนยัน
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Card>
        </div>
    );
};

export default DocumentsWaiting;
