import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ModerationDashboard = () => {
  // State to manage original and filtered content
  const [originalContent] = useState([
    { id: 1, user: '@john_doe', type: 'Text', content: 'Lorem ipsum dolor sit amet...', status: 'Pending' },
    { id: 2, user: '@jane_smith', type: 'Image', content: 'Image Content Placeholder', status: 'Approved' },
    { id: 3, user: '@user123', type: 'Video', content: 'Video Content Placeholder', status: 'Rejected' }
  ]);
  const [filteredContent, setFilteredContent] = useState(originalContent);

  // State to manage filter inputs
  const [statusFilter, setStatusFilter] = useState('All');
  const [contentTypeFilter, setContentTypeFilter] = useState('All');

  // Function to handle filter application
  const handleApplyFilters = (e) => {
    e.preventDefault(); // Prevent page reload

    // Filter logic
    const updatedContent = originalContent.filter(item => {
      const statusMatch = statusFilter === 'All' || item.status === statusFilter;
      const contentTypeMatch = contentTypeFilter === 'All' || item.type === contentTypeFilter;
      return statusMatch && contentTypeMatch;
    });

    // Update filtered content
    setFilteredContent(updatedContent);
  };

  return (
    <>
      {/* Sticky Navigation Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#f8f9fa',
        padding: '10px',
        zIndex: 1000,
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)'
      }}>
        <Container fluid>
          <Link to="/" style={{
            textDecoration: 'none',
            color: '#007bff',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            Return to main website
          </Link>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="mt-4">
        <Row>
          <Col md={3}>
            <Card>
              <Card.Header>Filters</Card.Header>
              <Card.Body>
                <Form onSubmit={handleApplyFilters}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Pending</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Content Type</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={contentTypeFilter} 
                      onChange={(e) => setContentTypeFilter(e.target.value)}
                    >
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
                    {filteredContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
                        <td>
                          {item.status !== 'Approved' && (
                            <Button variant="success" size="sm" className="me-2">
                              Approve
                            </Button>
                          )}
                          {item.status !== 'Rejected' && (
                            <Button variant="danger" size="sm">
                              Reject
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ModerationDashboard;
