import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';

const ModerationDashboard = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={3}>
          <Card>
            <Card.Header>Filters</Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Control as="select">
                    <option>All</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content Type</Form.Label>
                  <Form.Control as="select">
                    <option>All</option>
                    <option>Images</option>
                    <option>Videos</option>
                    <option>Text</option>
                  </Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Apply Filters
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Card>
            <Card.Header>Content Moderation</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Content</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>@john_doe</td>
                    <td>Text</td>
                    <td>Lorem ipsum dolor sit amet...</td>
                    <td>Pending</td>
                    <td>
                      <Button variant="success" size="sm" className="me-2">
                        Approve
                      </Button>
                      <Button variant="danger" size="sm">
                        Reject
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>@jane_smith</td>
                    <td>Image</td>
                    <td>Image Content Placeholder</td>
                    <td>Approved</td>
                    <td>
                      <Button variant="danger" size="sm">
                        Reject
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>@user123</td>
                    <td>Video</td>
                    <td>Video Content Placeholder</td>
                    <td>Rejected</td>
                    <td>
                      <Button variant="success" size="sm">
                        Approve
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModerationDashboard;