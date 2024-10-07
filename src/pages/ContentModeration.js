import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ModerationDashboard = () => {
  // State to manage original and filtered content
  const [originalContent, setOriginalContent] = useState([
    { id: 1, user: '@john_doe', type: 'Text', content: 'Lorem ipsum dolor sit amet...', status: 'Pending', numReports: 3 },
    { id: 2, user: '@jane_smith', type: 'Image', content: 'Image Content Placeholder', status: 'Approved', numReports: 1 },
    { id: 3, user: '@user123', type: 'Video', content: 'Video Content Placeholder', status: 'Rejected', numReports: 2 },
    { id: 4, user: '@mark_doe', type: 'Text', content: 'Another sample text', status: 'Approved', numReports: 4 },
    { id: 5, user: '@lisa_smith', type: 'Image', content: 'Another image content', status: 'Rejected', numReports: 5 },
    { id: 6, user: '@alex_jones', type: 'Text', content: 'This is a new pending text content...', status: 'Pending', numReports: 6 },
    { id: 7, user: '@kate_green', type: 'Image', content: 'Photo of a beautiful landscape...', status: 'Pending', numReports: 2 },
    { id: 8, user: '@peter_parker', type: 'Video', content: 'A short film about nature...', status: 'Pending', numReports: 1 },
    { id: 9, user: '@bruce_wayne', type: 'Text', content: 'An article about technology advancements...', status: 'Approved', numReports: 3 },
    { id: 10, user: '@clark_kent', type: 'Video', content: 'Interview clip with a tech expert...', status: 'Approved', numReports: 7 },
    { id: 11, user: '@diana_prince', type: 'Image', content: 'Photo from charity event...', status: 'Rejected', numReports: 4 },
    { id: 12, user: '@tony_stark', type: 'Video', content: 'Iron Man tech showcase...', status: 'Rejected', numReports: 5 },
    { id: 13, user: '@steve_rogers', type: 'Text', content: 'Historical event details...', status: 'Pending', numReports: 3 },
    { id: 14, user: '@natasha_romanoff', type: 'Image', content: 'Black Widow photo...', status: 'Pending', numReports: 8 },
    { id: 15, user: '@thor_odinson', type: 'Video', content: 'Thunderstorm documentary...', status: 'Approved', numReports: 2 },
    { id: 16, user: '@loki_laufeyson', type: 'Text', content: 'Mischief story...', status: 'Rejected', numReports: 6 },
    { id: 17, user: '@wanda_maximoff', type: 'Image', content: 'Magic trick captured...', status: 'Pending', numReports: 1 },
    { id: 18, user: '@vision', type: 'Text', content: 'AI perspective on human behavior...', status: 'Approved', numReports: 2 },
    { id: 19, user: '@sam_wilson', type: 'Video', content: 'Falcon flight footage...', status: 'Rejected', numReports: 5 },
    { id: 20, user: '@bucky_barnes', type: 'Text', content: 'Winter Soldier memoir...', status: 'Pending', numReports: 4 },
    { id: 21, user: '@tchalla', type: 'Image', content: 'Wakanda cityscape...', status: 'Approved', numReports: 3 },
    { id: 22, user: '@shuri', type: 'Video', content: 'Vibranium tech explanation...', status: 'Rejected', numReports: 7 },
    { id: 23, user: '@pepper_potts', type: 'Image', content: 'Company event photo...', status: 'Approved', numReports: 1 },
    { id: 24, user: '@happy_hogan', type: 'Text', content: 'Security protocol guide...', status: 'Pending', numReports: 5 },
    { id: 25, user: '@scott_lang', type: 'Video', content: 'Ant-man shrinking demo...', status: 'Pending', numReports: 2 },
    { id: 26, user: '@hope_van_dyne', type: 'Image', content: 'Wasp in action...', status: 'Approved', numReports: 4 },
    { id: 27, user: '@stephen_strange', type: 'Video', content: 'Mystical arts lecture...', status: 'Rejected', numReports: 6 },
    { id: 28, user: '@peter_quill', type: 'Text', content: 'Adventures in space...', status: 'Pending', numReports: 1 },
    { id: 29, user: '@gamora', type: 'Image', content: 'Photo from an alien planet...', status: 'Approved', numReports: 3 },
    { id: 30, user: '@rocket_raccoon', type: 'Text', content: 'Raccoon guide for building tech...', status: 'Rejected', numReports: 4 },
    { id: 31, user: '@groot', type: 'Image', content: 'Tree growth stages...', status: 'Pending', numReports: 2 },
    { id: 32, user: '@drax', type: 'Text', content: 'A story of strength and resilience...', status: 'Rejected', numReports: 5 },
    { id: 33, user: '@mantis', type: 'Video', content: 'Empathy and emotion demonstration...', status: 'Pending', numReports: 3 },
    { id: 34, user: '@nebula', type: 'Text', content: 'Cybernetics advancements...', status: 'Approved', numReports: 7 },
    { id: 35, user: '@nick_fury', type: 'Video', content: 'SHIELD training montage...', status: 'Approved', numReports: 6 }
  ]);


  
  // State to manage filter inputs
  const [statusFilter, setStatusFilter] = useState('All');
  const [contentTypeFilter, setContentTypeFilter] = useState('All');

  // Filtering content for tables
  const filteredContent = originalContent.filter(item => {
    const isPending = item.status === 'Pending';
    const statusMatch = statusFilter === 'All' || item.status === statusFilter;
    const contentTypeMatch = contentTypeFilter === 'All' || item.type.toLowerCase() === contentTypeFilter.toLowerCase().trim();
    return isPending && statusMatch && contentTypeMatch;
  });  

  const approvedContent = originalContent.filter(item => item.status === 'Approved');
  const rejectedContent = originalContent.filter(item => item.status === 'Rejected');

  // Function to handle approve/reject actions
  const handleModerationAction = (id, action) => {
    setOriginalContent(prevContent => 
      prevContent.map(item => {
        if (item.id === id) {
          if (action === 'approve') {
            console.log(`${item.user} report has been accepted`);
            return { ...item, status: 'Approved' };
          } else if (action === 'reject') {
            console.log(`${item.user} report has been rejected`);
            return { ...item, status: 'Rejected' };
          }
        }
        return item;
      })
    );
  };

  // Function to handle filter application
  const handleApplyFilters = () => {
    // This function currently doesn't need to do much as the filter is applied via state,
    // but it's defined here to prevent errors and can be extended if needed.
    console.log('Filters applied:', { statusFilter, contentTypeFilter });
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
                <Form onSubmit={(e) => e.preventDefault()}>

                  {/* Filters to filter reports by */}
                  <Form.Group className="mb-3">
                    <Form.Label>Content Type</Form.Label>
                    <Form.Control 
                      as="select" 
                      value={contentTypeFilter} 
                      onChange={(e) => setContentTypeFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>Image</option>
                      <option>Video</option>
                      <option>Text</option>
                    </Form.Control>
                  </Form.Group>

                  <Button variant="primary" onClick={handleApplyFilters}>
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
                      <th>Report ID</th>
                      <th>User Handle</th>
                      <th># Reports</th>
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
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
                        <td>
                          {item.status === 'Pending' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleModerationAction(item.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleModerationAction(item.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </>
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

        <Row className="mt-4">
          {/* Approved Actions Table */}
          <Col xs={12} md={6}>
            <Card>
              <Card.Header>Recent Approved Actions</Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User Handle</th>
                      <th># Reports</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Rejected Actions Table */}
          <Col xs={12} md={6}>
            <Card>
              <Card.Header>Recent Rejected Actions</Card.Header>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User Handle</th>
                      <th># Reports</th>
                      <th>Type</th>
                      <th>Content</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>{item.content}</td>
                        <td>{item.status}</td>
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
