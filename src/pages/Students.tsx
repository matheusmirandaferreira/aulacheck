import {
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Input } from 'reactstrap';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Container, Row } from 'reactstrap';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AddOutlined, DeleteOutline } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { DefaultModal } from '../components/DefaultModal';
import {
  getStudents,
  deleteStudent,
  createStudent,
} from '../services/students';

import { paths } from '../routes';
import { getClass } from '../services/class';
import { useAuth } from '../hooks/auth';

export function Students() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newParantEmail, setNewParentEmail] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('warning');
  const [alertMessage, setAlertMessage] = useState('');
  const [studentOnDelete, setStudentOnDelete] = useState({});

  const handleOpen = () => setIsOpen((prev) => !prev);

  const { isAdmin } = useAuth();

  const handleOpenDeleteModal = (student: any) => {
    if (!isAdmin) return;

    setStudentOnDelete(student);
    return setIsOpenDeleteModal((prev) => !prev);
  };

  const mutation = useMutation({
    mutationFn: deleteStudent,
    onError() {
      setAlertSeverity('error');
      setAlertMessage('Não foi possível deletar');
    },
    onSuccess: () => {
      query.refetch();
      setAlertSeverity('success');
      setAlertMessage('Deletado com sucesso!');
    },
  });

  const mutationCreate = useMutation({
    mutationFn: createStudent,

    onSuccess: () => {
      query.refetch();
      setAlertSeverity('success');
      setAlertMessage('Criado com sucesso!');
    },
  });

  const handleDelete = (uuid: string) => {
    mutation.mutate(uuid);
    setIsOpenDeleteModal(false);
    setSuccessOpen(true);
  };

  const handleCreate = async () => {
    if (
      newStudentName.trim() === '' ||
      newStudentEmail.trim() === '' ||
      newParantEmail.trim() === '' ||
      selectedClass.trim() === ''
    ) {
      setAlertMessage('Por favor, preencha todos os campos.');
      setAlertSeverity('error');
      setSuccessOpen(true);
      setIsOpen(false);
      return;
    }

    try {
      mutationCreate.mutate({
        nmstudent: newStudentName,
        email: newStudentEmail,
        classId: selectedClass,
        parentemail: newParantEmail,
      });
      setIsOpen(false);
    } catch (err) {
      setIsOpen(false);
      console.error(err);
    }
  };

  const query = useQuery({
    queryKey: ['GET_STUDENTS'],
    queryFn: getStudents,
  });

  const queryClass = useQuery({
    queryKey: ['GET_CLASS'],
    queryFn: getClass,
  });

  return (
    <Container>
      <Collapse in={successOpen}>
        <Alert
          severity={alertSeverity}
          action={
            <IconButton
              aria-label='close'
              color='inherit'
              size='small'
              onClick={() => {
                setSuccessOpen(false);
              }}
            >
              <CloseIcon fontSize='inherit' />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {alertMessage}
        </Alert>
      </Collapse>
      {query.isLoading ? (
        <div
          style={{
            height: '100vh',
          }}
          className='d-flex align-items-center justify-content-center'
        >
          <CircularProgress />
        </div>
      ) : (
        <div className='page-content'>
          <Row>
            <Col sm={6}>
              <h4>Lista de Alunos</h4>
            </Col>
            <Col sm={6} className='d-flex justify-content-end'>
              <Button
                onClick={handleOpen}
                className='d-flex align-items-center gap-2'
                color='primary'
                disabled={!isAdmin}
              >
                <AddOutlined />
                Adicionar
              </Button>
            </Col>
          </Row>
          <TableContainer component={Paper} className='mt-3'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell align='right'>E-mail</TableCell>
                  <TableCell align='right'>E-mail do responsável</TableCell>
                  <TableCell align='right'>Criado em</TableCell>
                  <TableCell align='right'>Editado em</TableCell>
                  <TableCell align='right'></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {query.data?.map((item) => (
                  <TableRow key={item.uuid}>
                    <TableCell>
                      <Link
                        to={paths.studentsDetails.replace(':uuid', item.uuid)}
                      >
                        {item.nmstudent}
                      </Link>
                    </TableCell>
                    <TableCell align='right'>{item.email}</TableCell>
                    <TableCell align='right'>{item.parentemail}</TableCell>

                    <TableCell align='right'>
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell align='right'>
                      {new Date(item.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip
                        title='Deletar aluno'
                        placement='top-start'
                        arrow
                      >
                        <DeleteOutline
                          color={isAdmin ? 'error' : 'disabled'}
                          onClick={() => handleOpenDeleteModal(item)}
                          style={{ cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <DefaultModal
            title='Adicionar aluno'
            toggle={handleOpen}
            isOpen={isOpen}
            onConfirm={() => handleCreate()}
          >
            <form className='d-flex flex-column gap-4'>
              <div className='d-flex flex-column gap-2 w-100'>
                Nome do aluno
                <Input
                  name='nmstudent'
                  label='Nome do aluno'
                  value={newStudentName}
                  onChange={(event: any) =>
                    setNewStudentName(event.target.value)
                  }
                />
              </div>
              <div className='d-flex flex-column gap-2 w-100'>
                E-mail do aluno
                <Input
                  name='email'
                  label='E-mail do aluno'
                  value={newStudentEmail}
                  onChange={(event: any) =>
                    setNewStudentEmail(event.target.value)
                  }
                />
              </div>
              <div className='d-flex flex-column gap-2 w-100'>
                E-mail do responsável
                <Input
                  name='email'
                  label='E-mail do responsável'
                  value={newParantEmail}
                  onChange={(event: any) =>
                    setNewParentEmail(event.target.value)
                  }
                />
              </div>
              <div className='d-flex flex-column gap-2 w-100'>
                <InputLabel id='demo-simple-select-label'>Turma</InputLabel>
                <Select
                  labelId='demo-simple-select-label'
                  id='demo-simple-select'
                  value={selectedClass}
                  label='Turma'
                  onChange={(event) => setSelectedClass(event.target.value)}
                >
                  {queryClass.data?.map((item) => (
                    <MenuItem key={item.uuid} value={item.uuid}>
                      {item.nmclass}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </form>
          </DefaultModal>

          <DefaultModal
            title='Confirmar exclusão'
            toggle={() => handleOpenDeleteModal(studentOnDelete)}
            isOpen={isOpenDeleteModal}
            onConfirm={() => handleDelete(studentOnDelete.uuid)}
            confirmLabel='Deletar'
            cancelLabel='Cancelar'
            confirmButtonColor='danger'
          >
            <p>
              Tem certeza de que deseja excluir o aluno{' '}
              <strong>{studentOnDelete.nmstudent}</strong>?
            </p>
          </DefaultModal>
        </div>
      )}
    </Container>
  );
}
