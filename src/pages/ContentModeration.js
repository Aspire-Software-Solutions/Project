import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, 
  Table, Form, Modal, Dropdown, DropdownButton 
  } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const ModerationDashboard = () => {

  // Init storage (needed for handling images and videos)
  const storage = getStorage();

  // State to manage filter inputs
  const [statusFilter, setStatusFilter] = useState('All');
  const [contentTypeFilter, setContentTypeFilter] = useState('All');
  const [imageUrl, setImageUrl] = useState('');

  // State for handling the modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Add state to manage rejection reason
  const [rejectReason, setRejectReason] = useState(''); 

  // State to manage original and filtered content (FAKE CONTENT)
  const [originalContent, setOriginalContent] = useState([
    { 
      id: 1, 
      user: '@john_doe', 
      type: 'Text', 
      content: 'Lorem ipsum dolor sit amet...', 
      status: 'Pending', 
      numReports: 3, 
      comments: [
        { date: '12-04-24 14:30', user: '@reporter1', message: 'Inappropriate content' },
        { date: '13-04-24 11:10', user: '@reporter2', message: 'Contains offensive language' },
      ]
    },
    { 
      id: 2, 
      user: '@jane_smith', 
      type: 'Image', 
      content: 'gs://fbproject-c27b4.appspot.com/images/MV5BMTY3Nzg0NDExNF5BMl5BanBnXkFtZTgwMDM4MTg1NDE@._V1_.jpg', 
      status: 'Approved', 
      numReports: 1, 
      comments: [
        { date: '14-04-24 09:50', user: '@reporter3', message: 'Unwanted promotional content' },
      ]
    },
    { 
      id: 3, 
      user: '@user123', 
      type: 'Video', 
      content: 'Video Content Placeholder', 
      status: 'Rejected', 
      numReports: 2, 
      comments: [
        { date: '15-04-24 18:45', user: '@reporter4', message: 'Spam video content' },
      ]
    },
    { 
      id: 4, 
      user: '@mark_doe', 
      type: 'Text', 
      content: 'Another sample text', 
      status: 'Approved', 
      numReports: 4, 
      comments: [
        { date: '16-04-24 12:30', user: '@reporter5', message: 'Plagiarized content' },
      ]
    },
    { 
      id: 5, 
      user: '@lisa_smith', 
      type: 'Image', 
      content: 'gs://fbproject-c27b4.appspot.com/images/MV5BMTY3Nzg0NDExNF5BMl5BanBnXkFtZTgwMDM4MTg1NDE@._V1_.jpg', 
      status: 'Rejected', 
      numReports: 5, 
      comments: [
        { date: '17-04-24 10:00', user: '@reporter6', message: 'Not suitable for children' },
      ]
    },
    { 
      id: 6, 
      user: '@alex_jones', 
      type: 'Text', 
      content: 'This is a new pending text content...', 
      status: 'Pending', 
      numReports: 6, 
      comments: [
        { date: '18-04-24 14:50', user: '@reporter7', message: 'Misleading information' },
      ]
    },
    { 
      id: 7, 
      user: '@kate_green', 
      type: 'Image', 
      content: 'gs://fbproject-c27b4.appspot.com/images/MV5BMTY3Nzg0NDExNF5BMl5BanBnXkFtZTgwMDM4MTg1NDE@._V1_.jpg', 
      status: 'Pending', 
      numReports: 2, 
      comments: [
        { date: '19-04-24 08:20', user: '@reporter8', message: 'Privacy concern' },
      ]
    },
    { 
      id: 8, 
      user: '@peter_parker', 
      type: 'Video', 
      content: 'A short film about nature...', 
      status: 'Pending', 
      numReports: 1, 
      comments: [
        { date: '20-04-24 17:30', user: '@reporter9', message: 'Irrelevant content' },
      ]
    },
    { 
      id: 9, 
      user: '@bruce_wayne', 
      type: 'Text', 
      content: 'An article about technology advancements...', 
      status: 'Approved', 
      numReports: 3, 
      comments: [
        { date: '21-04-24 15:00', user: '@reporter10', message: 'Plagiarized from another website' },
      ]
    },
    { 
      id: 10, 
      user: '@clark_kent', 
      type: 'Video', 
      content: 'Interview clip with a tech expert...', 
      status: 'Approved', 
      numReports: 7, 
      comments: [
        { date: '22-04-24 16:10', user: '@reporter11', message: 'Contains copyrighted material' },
      ]
    },
    { 
      id: 11, 
      user: '@diana_prince', 
      type: 'Image', 
      content: 'gs://fbproject-c27b4.appspot.com/images/MV5BMTY3Nzg0NDExNF5BMl5BanBnXkFtZTgwMDM4MTg1NDE@._V1_.jpg', 
      status: 'Rejected', 
      numReports: 4, 
      comments: [
        { date: '23-04-24 11:20', user: '@reporter12', message: 'Sensitive content' },
      ]
    },
    { 
      id: 12, 
      user: '@tony_stark', 
      type: 'Video', 
      content: 'Iron Man tech showcase...', 
      status: 'Rejected', 
      numReports: 5, 
      comments: [
        { date: '24-04-24 09:45', user: '@reporter13', message: 'Misleading claims' },
      ]
    }
    // Add additional reports as needed...
  ]);
  

  // Filtering content for tables
  const filteredContent = originalContent.filter(item => {
    const isPending = item.status === 'Pending';
    const statusMatch = statusFilter === 'All' || item.status === statusFilter;
    const contentTypeMatch = contentTypeFilter === 'All' || item.type.toLowerCase() === contentTypeFilter.toLowerCase().trim();
    return isPending && statusMatch && contentTypeMatch;
  });  

  const approvedContent = originalContent.filter(item => item.status === 'Approved');
  const rejectedContent = originalContent.filter(item => item.status === 'Rejected');

  // Function to handle opening the modal
  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
    setRejectReason('');
    if (report.type === "Image") {
      // Fetch the public URL for the image
      const storageRef = ref(storage, report.content);
      getDownloadURL(storageRef)
        .then((url) => {
          setImageUrl(url);
        })
        .catch((error) => {
          console.error("Error fetching image URL:", error);
          setImageUrl('');
        });
    } else {
      setImageUrl(''); // Reset if it's not an image
    }
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReport(null);
    setImageUrl(''); // Clear image URL when modal is closed
    setRejectReason('');
  };  

  // Function to handle approve/reject actions
  const handleModerationAction = (id, action) => {
    if (action === 'reject') {
      // Make sure a reason is selected before rejecting
      if (!rejectReason) {
        alert('Please select a reason for rejection.');
        return;
      }
      console.log(`Rejected for reason: ${rejectReason}`);
    }
  
    setOriginalContent(prevContent => 
      prevContent.map(item => {
        if (item.id === id) {
          if (action === 'approve') {
            console.log(`${item.user} report has been accepted`);
            return { ...item, status: 'Approved' };
          } else if (action === 'reject') {
            return { ...item, status: 'Rejected' };
          }
        }
        return item;
      })
    );
    
    handleCloseModal(); // Close the modal after taking action
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.user}</td>
                        <td>{item.numReports}</td>
                        <td>{item.type}</td>
                        <td>
                          {item.type === 'Image' ? '*image*' : 
                          item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
                        <td>
                          <Button 
                            variant="info" 
                            onClick={() => handleShowModal(item)}
                          >
                            View Details
                          </Button>
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
                        <td>
                          {item.type === 'Image' ? '*image*' : 
                          item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
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
                        <td>
                          {item.type === 'Image' ? '*image*' : 
                          item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                        </td>
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

     {/* Modal for Viewing Details */}
     <Modal show={showModal} onHide={handleCloseModal} style={{color: 'black'}}>
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedReport && `${selectedReport.user} Report #${selectedReport.id}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedReport ? (
          <>
            <div>
              <strong>Type: </strong> {selectedReport.type}
            </div>
            <div>
              <strong>Content: </strong>
              {selectedReport.type === 'Image' && imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Reported content"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : selectedReport.type === 'Video' && imageUrl ? (
                <video controls style={{ maxWidth: '100%', height: 'auto' }}>
                  <source src={imageUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                selectedReport.content.length > 50
                  ? `${selectedReport.content.substring(0, 50)}...`
                  : selectedReport.content
              )}
            </div>
            <div>
              <strong>Comments: </strong>
              {selectedReport.comments && selectedReport.comments.length > 0 ? (
                selectedReport.comments.map((comment, index) => (
                  <div key={index}>
                    {`${comment.date} - ${comment.user}: ${comment.message}`}
                  </div>
                ))
              ) : (
                <div>No comments available.</div>
              )}
            </div>
          </>
        ) : (
          <div>Loading report details...</div>
        )}
      </Modal.Body>


      <Modal.Footer>
        {selectedReport && (
          <>
            <Button variant="success" onClick={() => handleModerationAction(selectedReport.id, 'approve')}>
              Approve
            </Button>

            {/* Dropdown for rejection reasons */}
            <DropdownButton id="dropdown-rejection" title="Reject" variant="danger">
              <Dropdown.Item onClick={() => setRejectReason('dismiss')}>
                Dismiss report
                <br /><small className="text-muted">There's no violation of ToS.</small>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setRejectReason('warn')}>
                Remove content and warn user
                <br /><small className="text-muted">There is a minor violation of ToS.</small>
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setRejectReason('suspend')}>
                Remove content and suspend user
                <br /><small className="text-muted">There is a MAJOR violation of ToS.</small>
              </Dropdown.Item>
            </DropdownButton>
            
            <Button 
              variant="danger" 
              onClick={() => handleModerationAction(selectedReport.id, 'reject')}
              disabled={!rejectReason} // disable button if no reason selected
            >
              Confirm Rejection
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>


    </>
  );


};

export default ModerationDashboard;
