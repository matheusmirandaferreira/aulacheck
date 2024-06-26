import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getCourseById,
  getStudentsByCourse,
  getTeacherByCourse,
} from '../services/courses';
import { paths } from '../routes';
import {
  Avatar,
  Card,
  CardHeader,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { Download, HowToReg } from '@mui/icons-material';
import { blue } from '@mui/material/colors';
import { Button, Col, Container, Row } from 'reactstrap';
import { StudentFrequencyTable } from '../components/StudentFrequencyTable';
import { useAuth } from '../hooks/auth';
import LowFrequencyStudentsModal from '../components/LowFrequencyStudentsModal';
import * as XLSX from 'xlsx';

export function CourseDetails() {
  const location = useLocation();
  const { newRollCall } = location.state || false;
  const { isStudent } = useAuth();
  const { uuid } = useParams();
  const navigate = useNavigate();

  const checkLowFrequencyStudent = (students) => {
    const lowFrequencyStudents = [];
    students.forEach((student) => {
      if (student.classroomDetails.frequence < 80) {
        lowFrequencyStudents.push(student);
      }
    });
    return lowFrequencyStudents;
  };

  const courseQuery = useQuery({
    queryKey: ['GET_COURSE'],
    queryFn: () => getCourseById(uuid || ''),
  });

  const course = courseQuery.data;
  const teacherQuery = useQuery({
    queryKey: ['GET_TEACHER'],
    queryFn: () => getTeacherByCourse(uuid || ''),
  });

  const teacher = teacherQuery.data;
  const queryStudents = useQuery({
    queryKey: [`GET_STUDENTS_${course?.uuid}`],
    queryFn: () => getStudentsByCourse(course?.uuid || ''),
  });

  const students = queryStudents.data || [];
  const lowFrequencyStudents = checkLowFrequencyStudent(students);

  const generateExcelReport = () => {
    const data = students.map((student) => ({
      Nome: student.nmstudent,
      Email: student.email,
      Faltas: student.classroomDetails.numberOfAbsent,
      Frequência: student.classroomDetails.frequence,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Frequência dos Alunos');

    XLSX.writeFile(workbook, 'Relatorio_Frequencia.xlsx');
  };

  return (
    <Container>
      <div className='page-content'>
        {lowFrequencyStudents.length > 0 && newRollCall && (
          <LowFrequencyStudentsModal
            students={checkLowFrequencyStudent(students)}
          />
        )}
        <Row>
          <Col sm={6}>
            <h4>Detalhes da Matéria</h4>
          </Col>
          <Col sm={6} className='d-flex justify-content-end'>
            {!isStudent && (
              <Button
                onClick={generateExcelReport}
                className='d-flex align-items-center gap-2'
                style={{ marginRight: '10px' }}
                color='dark'
              >
                <Download />
                Exportar relatório Excel
              </Button>
            )}
            {!isStudent && (
              <Button
                onClick={() => {
                  navigate(paths.classRoomRollCall, {
                    state: { course: course },
                  });
                }}
                className='d-flex align-items-center gap-2'
                color='primary'
              >
                <HowToReg />
                Realizar chamada
              </Button>
            )}
          </Col>
        </Row>

        <Card className='mt-3'>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: blue[500] }} aria-label='recipe'>
                {course && course.nmcourse.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={course && course.nmcourse}
            subheader={teacher && teacher.nmteacher}
          />
        </Card>

        <TableContainer component={Paper} className='mt-3'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Nome</TableCell>
                <TableCell align='center'>E-mail</TableCell>
                <TableCell align='center'>Faltas</TableCell>
                <TableCell align='center'>Frequência</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students?.map((item) => (
                <StudentFrequencyTable
                  key={item.uuid}
                  student={item}
                  course={course}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Container>
  );
}
