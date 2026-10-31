export interface IndianLocation {
  name: string; // Display label
  locality?: string;
  city: string;
  district: string;
  state: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  type: 'CITY' | 'LOCALITY' | 'TOWN';
}

export const INDIAN_LOCATIONS: IndianLocation[] = [
  // --- UTTAR PRADESH ---
  { name: 'Gorakhpur, Uttar Pradesh', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273001', latitude: 26.7606, longitude: 83.3732, type: 'CITY' },
  { name: 'GIDA, Gorakhpur', locality: 'GIDA', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273209', latitude: 26.7455, longitude: 83.2721, type: 'LOCALITY' },
  { name: 'Golghar, Gorakhpur', locality: 'Golghar', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273001', latitude: 26.7588, longitude: 83.3704, type: 'LOCALITY' },
  { name: 'Medical College Road, Gorakhpur', locality: 'Medical College', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273013', latitude: 26.7925, longitude: 83.3855, type: 'LOCALITY' },
  { name: 'Mohaddipur, Gorakhpur', locality: 'Mohaddipur', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273008', latitude: 26.7512, longitude: 83.3951, type: 'LOCALITY' },
  { name: 'Sahjanwa, Gorakhpur', locality: 'Sahjanwa', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273209', latitude: 26.7592, longitude: 83.2125, type: 'TOWN' },
  { name: 'Deoria, Uttar Pradesh', city: 'Deoria', district: 'Deoria', state: 'Uttar Pradesh', pincode: '274001', latitude: 26.5024, longitude: 83.7791, type: 'CITY' },
  { name: 'Raghav Nagar, Deoria', locality: 'Raghav Nagar', city: 'Deoria', district: 'Deoria', state: 'Uttar Pradesh', pincode: '274001', latitude: 26.5055, longitude: 83.7822, type: 'LOCALITY' },
  { name: 'Bhatpar Rani, Deoria', locality: 'Bhatpar Rani', city: 'Deoria', district: 'Deoria', state: 'Uttar Pradesh', pincode: '274702', latitude: 26.3156, longitude: 84.0322, type: 'TOWN' },
  { name: 'Salempur, Deoria', locality: 'Salempur', city: 'Deoria', district: 'Deoria', state: 'Uttar Pradesh', pincode: '274509', latitude: 26.3012, longitude: 83.9214, type: 'TOWN' },
  { name: 'Lucknow, Uttar Pradesh', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', latitude: 26.8467, longitude: 80.9462, type: 'CITY' },
  { name: 'Hazratganj, Lucknow', locality: 'Hazratganj', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', latitude: 26.8524, longitude: 80.9452, type: 'LOCALITY' },
  { name: 'Gomti Nagar, Lucknow', locality: 'Gomti Nagar', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226010', latitude: 26.8532, longitude: 81.0028, type: 'LOCALITY' },
  { name: 'Alambagh, Lucknow', locality: 'Alambagh', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226005', latitude: 26.8122, longitude: 80.9022, type: 'LOCALITY' },
  { name: 'Varanasi, Uttar Pradesh', city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', latitude: 25.3176, longitude: 82.9739, type: 'CITY' },
  { name: 'Lanka, Varanasi', locality: 'Lanka (BHU)', city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', pincode: '221005', latitude: 25.2812, longitude: 82.9984, type: 'LOCALITY' },
  { name: 'Kanpur, Uttar Pradesh', city: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', pincode: '208001', latitude: 26.4499, longitude: 80.3319, type: 'CITY' },
  { name: 'Prayagraj (Allahabad), Uttar Pradesh', city: 'Prayagraj', district: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001', latitude: 25.4358, longitude: 81.8463, type: 'CITY' },
  { name: 'Civil Lines, Prayagraj', locality: 'Civil Lines', city: 'Prayagraj', district: 'Prayagraj', state: 'Uttar Pradesh', pincode: '211001', latitude: 25.4522, longitude: 81.8344, type: 'LOCALITY' },
  { name: 'Agra, Uttar Pradesh', city: 'Agra', district: 'Agra', state: 'Uttar Pradesh', pincode: '282001', latitude: 27.1767, longitude: 78.0081, type: 'CITY' },
  { name: 'Noida, Uttar Pradesh', city: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', pincode: '201301', latitude: 28.5355, longitude: 77.3910, type: 'CITY' },
  { name: 'Sector 62, Noida', locality: 'Sector 62', city: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', pincode: '201309', latitude: 28.6256, longitude: 77.3688, type: 'LOCALITY' },
  { name: 'Greater Noida, Uttar Pradesh', city: 'Greater Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', pincode: '201310', latitude: 28.4744, longitude: 77.5040, type: 'CITY' },
  { name: 'Ghaziabad, Uttar Pradesh', city: 'Ghaziabad', district: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201001', latitude: 28.6692, longitude: 77.4538, type: 'CITY' },
  { name: 'Indirapuram, Ghaziabad', locality: 'Indirapuram', city: 'Ghaziabad', district: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014', latitude: 28.6412, longitude: 77.3712, type: 'LOCALITY' },
  { name: 'Meerut, Uttar Pradesh', city: 'Meerut', district: 'Meerut', state: 'Uttar Pradesh', pincode: '250001', latitude: 28.9845, longitude: 77.7064, type: 'CITY' },
  { name: 'Ayodhya (Faizabad), Uttar Pradesh', city: 'Ayodhya', district: 'Ayodhya', state: 'Uttar Pradesh', pincode: '224123', latitude: 26.7922, longitude: 82.1998, type: 'CITY' },
  { name: 'Bareilly, Uttar Pradesh', city: 'Bareilly', district: 'Bareilly', state: 'Uttar Pradesh', pincode: '243001', latitude: 28.3670, longitude: 79.4304, type: 'CITY' },
  { name: 'Aligarh, Uttar Pradesh', city: 'Aligarh', district: 'Aligarh', state: 'Uttar Pradesh', pincode: '202001', latitude: 27.8974, longitude: 78.0880, type: 'CITY' },
  { name: 'Moradabad, Uttar Pradesh', city: 'Moradabad', district: 'Moradabad', state: 'Uttar Pradesh', pincode: '244001', latitude: 28.8386, longitude: 78.7733, type: 'CITY' },
  { name: 'Basti, Uttar Pradesh', city: 'Basti', district: 'Basti', state: 'Uttar Pradesh', pincode: '272001', latitude: 26.8122, longitude: 82.7634, type: 'CITY' },
  { name: 'Kushinagar, Uttar Pradesh', city: 'Kushinagar', district: 'Kushinagar', state: 'Uttar Pradesh', pincode: '274403', latitude: 26.7408, longitude: 83.8887, type: 'TOWN' },
  { name: 'Padrauna, Kushinagar', locality: 'Padrauna', city: 'Padrauna', district: 'Kushinagar', state: 'Uttar Pradesh', pincode: '274304', latitude: 26.9022, longitude: 83.9812, type: 'TOWN' },
  { name: 'Maharajganj, Uttar Pradesh', city: 'Maharajganj', district: 'Maharajganj', state: 'Uttar Pradesh', pincode: '273303', latitude: 27.1432, longitude: 83.5622, type: 'TOWN' },
  { name: 'Azamgarh, Uttar Pradesh', city: 'Azamgarh', district: 'Azamgarh', state: 'Uttar Pradesh', pincode: '276001', latitude: 26.0688, longitude: 83.1834, type: 'CITY' },
  { name: 'Ballia, Uttar Pradesh', city: 'Ballia', district: 'Ballia', state: 'Uttar Pradesh', pincode: '277001', latitude: 25.7588, longitude: 84.1487, type: 'CITY' },
  { name: 'Mau, Uttar Pradesh', city: 'Mau', district: 'Mau', state: 'Uttar Pradesh', pincode: '275101', latitude: 25.9417, longitude: 83.5611, type: 'CITY' },
  { name: 'Ghazipur, Uttar Pradesh', city: 'Ghazipur', district: 'Ghazipur', state: 'Uttar Pradesh', pincode: '233001', latitude: 25.5861, longitude: 83.5786, type: 'CITY' },
  { name: 'Jaunpur, Uttar Pradesh', city: 'Jaunpur', district: 'Jaunpur', state: 'Uttar Pradesh', pincode: '222001', latitude: 25.7464, longitude: 82.6837, type: 'CITY' },
  { name: 'Sultanpur, Uttar Pradesh', city: 'Sultanpur', district: 'Sultanpur', state: 'Uttar Pradesh', pincode: '228001', latitude: 26.2648, longitude: 82.0727, type: 'CITY' },
  { name: 'Jhansi, Uttar Pradesh', city: 'Jhansi', district: 'Jhansi', state: 'Uttar Pradesh', pincode: '284001', latitude: 25.4484, longitude: 78.5685, type: 'CITY' },
  { name: 'Mathura, Uttar Pradesh', city: 'Mathura', district: 'Mathura', state: 'Uttar Pradesh', pincode: '281001', latitude: 27.4924, longitude: 77.6737, type: 'CITY' },

  // --- KARNATAKA ---
  { name: 'Bengaluru, Karnataka', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001', latitude: 12.9716, longitude: 77.5946, type: 'CITY' },
  { name: 'Koramangala, Bengaluru', locality: 'Koramangala', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, type: 'LOCALITY' },
  { name: 'Indiranagar, Bengaluru', locality: 'Indiranagar', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560038', latitude: 12.9784, longitude: 77.6408, type: 'LOCALITY' },
  { name: 'HSR Layout, Bengaluru', locality: 'HSR Layout', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560102', latitude: 12.9121, longitude: 77.6446, type: 'LOCALITY' },
  { name: 'Whitefield, Bengaluru', locality: 'Whitefield', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.7500, type: 'LOCALITY' },
  { name: 'Jayanagar, Bengaluru', locality: 'Jayanagar', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560011', latitude: 12.9308, longitude: 77.5838, type: 'LOCALITY' },
  { name: 'Nelamangala, Bengaluru Rural', locality: 'Nelamangala', city: 'Bengaluru', district: 'Bengaluru Rural', state: 'Karnataka', pincode: '562123', latitude: 13.0988, longitude: 77.3912, type: 'TOWN' },
  { name: 'Mysuru, Karnataka', city: 'Mysuru', district: 'Mysuru', state: 'Karnataka', pincode: '570001', latitude: 12.2958, longitude: 76.6394, type: 'CITY' },
  { name: 'Hubballi-Dharwad, Karnataka', city: 'Hubballi', district: 'Dharwad', state: 'Karnataka', pincode: '580020', latitude: 15.3647, longitude: 75.1240, type: 'CITY' },
  { name: 'Mangaluru, Karnataka', city: 'Mangaluru', district: 'Dakshina Kannada', state: 'Karnataka', pincode: '575001', latitude: 12.9141, longitude: 74.8560, type: 'CITY' },
  { name: 'Belagavi, Karnataka', city: 'Belagavi', district: 'Belagavi', state: 'Karnataka', pincode: '590001', latitude: 15.8497, longitude: 74.4977, type: 'CITY' },
  { name: 'Kalaburagi (Gulbarga), Karnataka', city: 'Kalaburagi', district: 'Kalaburagi', state: 'Karnataka', pincode: '585101', latitude: 17.3297, longitude: 76.8343, type: 'CITY' },
  { name: 'Davanagere, Karnataka', city: 'Davanagere', district: 'Davanagere', state: 'Karnataka', pincode: '577002', latitude: 14.4644, longitude: 75.9218, type: 'CITY' },
  { name: 'Ballari, Karnataka', city: 'Ballari', district: 'Ballari', state: 'Karnataka', pincode: '583101', latitude: 15.1394, longitude: 76.9214, type: 'CITY' },
  { name: 'Shivamogga, Karnataka', city: 'Shivamogga', district: 'Shivamogga', state: 'Karnataka', pincode: '577201', latitude: 13.9299, longitude: 75.5681, type: 'CITY' },
  { name: 'Tumakuru, Karnataka', city: 'Tumakuru', district: 'Tumakuru', state: 'Karnataka', pincode: '572101', latitude: 13.3379, longitude: 77.1010, type: 'CITY' },
  { name: 'Udupi, Karnataka', city: 'Udupi', district: 'Udupi', state: 'Karnataka', pincode: '576101', latitude: 13.3409, longitude: 74.7421, type: 'CITY' },

  // --- DELHI NCR ---
  { name: 'Delhi, National Capital Region', city: 'Delhi', district: 'Central Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6139, longitude: 77.2090, type: 'CITY' },
  { name: 'Connaught Place, New Delhi', locality: 'Connaught Place', city: 'Delhi', district: 'New Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6315, longitude: 77.2167, type: 'LOCALITY' },
  { name: 'South Extension, New Delhi', locality: 'South Extension', city: 'Delhi', district: 'South Delhi', state: 'Delhi', pincode: '110049', latitude: 28.5728, longitude: 77.2228, type: 'LOCALITY' },
  { name: 'Dwarka, New Delhi', locality: 'Dwarka', city: 'Delhi', district: 'South West Delhi', state: 'Delhi', pincode: '110075', latitude: 28.5921, longitude: 77.0460, type: 'LOCALITY' },
  { name: 'Rohini, New Delhi', locality: 'Rohini', city: 'Delhi', district: 'North West Delhi', state: 'Delhi', pincode: '110085', latitude: 28.7383, longitude: 77.0822, type: 'LOCALITY' },
  { name: 'Gurugram (Gurgaon), Haryana', city: 'Gurugram', district: 'Gurugram', state: 'Haryana', pincode: '122001', latitude: 28.4595, longitude: 77.0266, type: 'CITY' },
  { name: 'Cyber City, Gurugram', locality: 'Cyber City', city: 'Gurugram', district: 'Gurugram', state: 'Haryana', pincode: '122002', latitude: 28.4950, longitude: 77.0895, type: 'LOCALITY' },
  { name: 'Faridabad, Haryana', city: 'Faridabad', district: 'Faridabad', state: 'Haryana', pincode: '121001', latitude: 28.4089, longitude: 77.3178, type: 'CITY' },

  // --- MAHARASHTRA ---
  { name: 'Mumbai, Maharashtra', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400001', latitude: 19.0760, longitude: 72.8777, type: 'CITY' },
  { name: 'Andheri West, Mumbai', locality: 'Andheri West', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400058', latitude: 19.1197, longitude: 72.8468, type: 'LOCALITY' },
  { name: 'Bandra West, Mumbai', locality: 'Bandra West', city: 'Mumbai', district: 'Mumbai Suburban', state: 'Maharashtra', pincode: '400050', latitude: 19.0596, longitude: 72.8295, type: 'LOCALITY' },
  { name: 'Colaba, South Mumbai', locality: 'Colaba', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', pincode: '400005', latitude: 18.9067, longitude: 72.8147, type: 'LOCALITY' },
  { name: 'Pune, Maharashtra', city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5204, longitude: 73.8567, type: 'CITY' },
  { name: 'Kothrud, Pune', locality: 'Kothrud', city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411038', latitude: 18.5074, longitude: 73.8077, type: 'LOCALITY' },
  { name: 'Hinjawadi, Pune', locality: 'Hinjawadi IT Park', city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411057', latitude: 18.5913, longitude: 73.7389, type: 'LOCALITY' },
  { name: 'Nagpur, Maharashtra', city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', pincode: '440001', latitude: 21.1458, longitude: 79.0882, type: 'CITY' },
  { name: 'Nashik, Maharashtra', city: 'Nashik', district: 'Nashik', state: 'Maharashtra', pincode: '422001', latitude: 19.9975, longitude: 73.7898, type: 'CITY' },
  { name: 'Thane, Maharashtra', city: 'Thane', district: 'Thane', state: 'Maharashtra', pincode: '400601', latitude: 19.2183, longitude: 72.9781, type: 'CITY' },
  { name: 'Chhatrapati Sambhajinagar (Aurangabad), Maharashtra', city: 'Chhatrapati Sambhajinagar', district: 'Aurangabad', state: 'Maharashtra', pincode: '431001', latitude: 19.8762, longitude: 75.3433, type: 'CITY' },
  { name: 'Solapur, Maharashtra', city: 'Solapur', district: 'Solapur', state: 'Maharashtra', pincode: '413001', latitude: 17.6599, longitude: 75.9064, type: 'CITY' },
  { name: 'Kolhapur, Maharashtra', city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra', pincode: '416003', latitude: 16.7050, longitude: 74.2433, type: 'CITY' },

  // --- BIHAR ---
  { name: 'Patna, Bihar', city: 'Patna', district: 'Patna', state: 'Bihar', pincode: '800001', latitude: 25.5941, longitude: 85.1376, type: 'CITY' },
  { name: 'Kankarbagh, Patna', locality: 'Kankarbagh', city: 'Patna', district: 'Patna', state: 'Bihar', pincode: '800020', latitude: 25.5988, longitude: 85.1512, type: 'LOCALITY' },
  { name: 'Boring Road, Patna', locality: 'Boring Road', city: 'Patna', district: 'Patna', state: 'Bihar', pincode: '800001', latitude: 25.6144, longitude: 85.1188, type: 'LOCALITY' },
  { name: 'Gaya, Bihar', city: 'Gaya', district: 'Gaya', state: 'Bihar', pincode: '823001', latitude: 24.7914, longitude: 85.0002, type: 'CITY' },
  { name: 'Muzaffarpur, Bihar', city: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', pincode: '842001', latitude: 26.1209, longitude: 85.3647, type: 'CITY' },
  { name: 'Bhagalpur, Bihar', city: 'Bhagalpur', district: 'Bhagalpur', state: 'Bihar', pincode: '812001', latitude: 25.2425, longitude: 86.9842, type: 'CITY' },
  { name: 'Darbhanga, Bihar', city: 'Darbhanga', district: 'Darbhanga', state: 'Bihar', pincode: '846004', latitude: 26.1542, longitude: 85.8918, type: 'CITY' },
  { name: 'Purnia, Bihar', city: 'Purnia', district: 'Purnia', state: 'Bihar', pincode: '854301', latitude: 25.7771, longitude: 87.4753, type: 'CITY' },
  { name: 'Begusarai, Bihar', city: 'Begusarai', district: 'Begusarai', state: 'Bihar', pincode: '851101', latitude: 25.4182, longitude: 86.1272, type: 'CITY' },

  // --- RAJASTHAN ---
  { name: 'Jaipur, Rajasthan', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', pincode: '302001', latitude: 26.9124, longitude: 75.7873, type: 'CITY' },
  { name: 'Malviya Nagar, Jaipur', locality: 'Malviya Nagar', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', pincode: '302017', latitude: 26.8542, longitude: 75.8244, type: 'LOCALITY' },
  { name: 'Jodhpur, Rajasthan', city: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', pincode: '342001', latitude: 26.2389, longitude: 73.0243, type: 'CITY' },
  { name: 'Kota, Rajasthan', city: 'Kota', district: 'Kota', state: 'Rajasthan', pincode: '324001', latitude: 25.2138, longitude: 75.8648, type: 'CITY' },
  { name: 'Udaipur, Rajasthan', city: 'Udaipur', district: 'Udaipur', state: 'Rajasthan', pincode: '313001', latitude: 24.5854, longitude: 73.7125, type: 'CITY' },
  { name: 'Bikaner, Rajasthan', city: 'Bikaner', district: 'Bikaner', state: 'Rajasthan', pincode: '334001', latitude: 28.0229, longitude: 73.3119, type: 'CITY' },

  // --- GUJARAT ---
  { name: 'Ahmedabad, Gujarat', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', pincode: '380001', latitude: 23.0225, longitude: 72.5714, type: 'CITY' },
  { name: 'Navrangpura, Ahmedabad', locality: 'Navrangpura', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', pincode: '380009', latitude: 23.0365, longitude: 72.5611, type: 'LOCALITY' },
  { name: 'Surat, Gujarat', city: 'Surat', district: 'Surat', state: 'Gujarat', pincode: '395003', latitude: 21.1702, longitude: 72.8311, type: 'CITY' },
  { name: 'Vadodara (Baroda), Gujarat', city: 'Vadodara', district: 'Vadodara', state: 'Gujarat', pincode: '390001', latitude: 22.3072, longitude: 73.1812, type: 'CITY' },
  { name: 'Rajkot, Gujarat', city: 'Rajkot', district: 'Rajkot', state: 'Gujarat', pincode: '360001', latitude: 22.3039, longitude: 70.8022, type: 'CITY' },

  // --- TAMIL NADU ---
  { name: 'Chennai, Tamil Nadu', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600001', latitude: 13.0827, longitude: 80.2707, type: 'CITY' },
  { name: 'T. Nagar, Chennai', locality: 'T. Nagar', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', pincode: '600017', latitude: 13.0418, longitude: 80.2341, type: 'LOCALITY' },
  { name: 'Coimbatore, Tamil Nadu', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001', latitude: 11.0168, longitude: 76.9558, type: 'CITY' },
  { name: 'Madurai, Tamil Nadu', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', pincode: '625001', latitude: 9.9252, longitude: 78.1198, type: 'CITY' },
  { name: 'Tiruchirappalli (Trichy), Tamil Nadu', city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', pincode: '620001', latitude: 10.7905, longitude: 78.7047, type: 'CITY' },
  { name: 'Salem, Tamil Nadu', city: 'Salem', district: 'Salem', state: 'Tamil Nadu', pincode: '636001', latitude: 11.6643, longitude: 78.1460, type: 'CITY' },

  // --- TELANGANA & ANDHRA PRADESH ---
  { name: 'Hyderabad, Telangana', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', pincode: '500001', latitude: 17.3850, longitude: 78.4867, type: 'CITY' },
  { name: 'Hitec City, Hyderabad', locality: 'Hitec City / Madhapur', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', pincode: '500081', latitude: 17.4435, longitude: 78.3772, type: 'LOCALITY' },
  { name: 'Warangal, Telangana', city: 'Warangal', district: 'Warangal', state: 'Telangana', pincode: '506002', latitude: 17.9689, longitude: 79.5941, type: 'CITY' },
  { name: 'Visakhapatnam (Vizag), Andhra Pradesh', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', pincode: '530001', latitude: 17.6868, longitude: 83.2185, type: 'CITY' },
  { name: 'Vijayawada, Andhra Pradesh', city: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', pincode: '520001', latitude: 16.5062, longitude: 80.6480, type: 'CITY' },
  { name: 'Guntur, Andhra Pradesh', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', pincode: '522002', latitude: 16.3067, longitude: 80.4365, type: 'CITY' },
  { name: 'Tirupati, Andhra Pradesh', city: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', pincode: '517501', latitude: 13.6288, longitude: 79.4192, type: 'CITY' },

  // --- WEST BENGAL ---
  { name: 'Kolkata, West Bengal', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', pincode: '700001', latitude: 22.5726, longitude: 88.3639, type: 'CITY' },
  { name: 'Salt Lake (Bidhannagar), Kolkata', locality: 'Salt Lake Sector V', city: 'Kolkata', district: 'North 24 Parganas', state: 'West Bengal', pincode: '700091', latitude: 22.5802, longitude: 88.4273, type: 'LOCALITY' },
  { name: 'Howrah, West Bengal', city: 'Howrah', district: 'Howrah', state: 'West Bengal', pincode: '711101', latitude: 22.5958, longitude: 88.2636, type: 'CITY' },
  { name: 'Siliguri, West Bengal', city: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', pincode: '734001', latitude: 26.7271, longitude: 88.3953, type: 'CITY' },
  { name: 'Durgapur, West Bengal', city: 'Durgapur', district: 'Paschim Bardhaman', state: 'West Bengal', pincode: '713201', latitude: 23.5204, longitude: 87.3119, type: 'CITY' },

  // --- MADHYA PRADESH ---
  { name: 'Bhopal, Madhya Pradesh', city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001', latitude: 23.2599, longitude: 77.4126, type: 'CITY' },
  { name: 'Indore, Madhya Pradesh', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', pincode: '452001', latitude: 22.7196, longitude: 75.8577, type: 'CITY' },
  { name: 'Jabalpur, Madhya Pradesh', city: 'Jabalpur', district: 'Jabalpur', state: 'Madhya Pradesh', pincode: '482001', latitude: 23.1815, longitude: 79.9864, type: 'CITY' },
  { name: 'Gwalior, Madhya Pradesh', city: 'Gwalior', district: 'Gwalior', state: 'Madhya Pradesh', pincode: '474001', latitude: 26.2183, longitude: 78.1828, type: 'CITY' },
  { name: 'Ujjain, Madhya Pradesh', city: 'Ujjain', district: 'Ujjain', state: 'Madhya Pradesh', pincode: '456001', latitude: 23.1765, longitude: 75.7885, type: 'CITY' },

  // --- KERALA ---
  { name: 'Kochi (Cochin), Kerala', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', pincode: '682001', latitude: 9.9312, longitude: 76.2673, type: 'CITY' },
  { name: 'Thiruvananthapuram, Kerala', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001', latitude: 8.5241, longitude: 76.9366, type: 'CITY' },
  { name: 'Kozhikode (Calicut), Kerala', city: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', pincode: '673001', latitude: 11.2588, longitude: 75.7804, type: 'CITY' },

  // --- PUNJAB, HARYANA & CHANDIGARH ---
  { name: 'Chandigarh, Union Territory', city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', pincode: '160017', latitude: 30.7333, longitude: 76.7794, type: 'CITY' },
  { name: 'Ludhiana, Punjab', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', pincode: '141001', latitude: 30.9010, longitude: 75.8573, type: 'CITY' },
  { name: 'Amritsar, Punjab', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', pincode: '143001', latitude: 31.6340, longitude: 74.8723, type: 'CITY' },
  { name: 'Jalandhar, Punjab', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', pincode: '144001', latitude: 31.3260, longitude: 75.5762, type: 'CITY' },
  { name: 'Ambala, Haryana', city: 'Ambala', district: 'Ambala', state: 'Haryana', pincode: '134003', latitude: 30.3782, longitude: 76.7767, type: 'CITY' },

  // --- OTHER STATES & UNION TERRITORIES ---
  { name: 'Ranchi, Jharkhand', city: 'Ranchi', district: 'Ranchi', state: 'Jharkhand', pincode: '834001', latitude: 23.3441, longitude: 85.3096, type: 'CITY' },
  { name: 'Jamshedpur, Jharkhand', city: 'Jamshedpur', district: 'East Singhbhum', state: 'Jharkhand', pincode: '831001', latitude: 22.8046, longitude: 86.2029, type: 'CITY' },
  { name: 'Bhubaneswar, Odisha', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', pincode: '751001', latitude: 20.2961, longitude: 85.8245, type: 'CITY' },
  { name: 'Cuttack, Odisha', city: 'Cuttack', district: 'Cuttack', state: 'Odisha', pincode: '753001', latitude: 20.4625, longitude: 85.8828, type: 'CITY' },
  { name: 'Raipur, Chhattisgarh', city: 'Raipur', district: 'Raipur', state: 'Chhattisgarh', pincode: '492001', latitude: 21.2514, longitude: 81.6296, type: 'CITY' },
  { name: 'Dehradun, Uttarakhand', city: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', pincode: '248001', latitude: 30.3165, longitude: 78.0322, type: 'CITY' },
  { name: 'Haridwar, Uttarakhand', city: 'Haridwar', district: 'Haridwar', state: 'Uttarakhand', pincode: '249401', latitude: 29.9457, longitude: 78.1642, type: 'CITY' },
  { name: 'Shimla, Himachal Pradesh', city: 'Shimla', district: 'Shimla', state: 'Himachal Pradesh', pincode: '171001', latitude: 31.1048, longitude: 77.1734, type: 'CITY' },
  { name: 'Srinagar, Jammu & Kashmir', city: 'Srinagar', district: 'Srinagar', state: 'Jammu and Kashmir', pincode: '190001', latitude: 34.0837, longitude: 74.7973, type: 'CITY' },
  { name: 'Jammu, Jammu & Kashmir', city: 'Jammu', district: 'Jammu', state: 'Jammu and Kashmir', pincode: '180001', latitude: 32.7266, longitude: 74.8570, type: 'CITY' },
  { name: 'Guwahati, Assam', city: 'Guwahati', district: 'Kamrup Metropolitan', state: 'Assam', pincode: '781001', latitude: 26.1445, longitude: 91.7362, type: 'CITY' },
  { name: 'Panaji, Goa', city: 'Panaji', district: 'North Goa', state: 'Goa', pincode: '403001', latitude: 15.4909, longitude: 73.8278, type: 'CITY' },
  { name: 'Puducherry, Union Territory', city: 'Puducherry', district: 'Puducherry', state: 'Puducherry', pincode: '605001', latitude: 11.9416, longitude: 79.8083, type: 'CITY' },
];

export const POPULAR_HUBS: IndianLocation[] = [
  { name: 'Gorakhpur, Uttar Pradesh', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273001', latitude: 26.7606, longitude: 83.3732, type: 'CITY' },
  { name: 'GIDA, Gorakhpur', locality: 'GIDA', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', pincode: '273209', latitude: 26.7455, longitude: 83.2721, type: 'LOCALITY' },
  { name: 'Deoria, Uttar Pradesh', city: 'Deoria', district: 'Deoria', state: 'Uttar Pradesh', pincode: '274001', latitude: 26.5024, longitude: 83.7791, type: 'CITY' },
  { name: 'Lucknow, Uttar Pradesh', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001', latitude: 26.8467, longitude: 80.9462, type: 'CITY' },
  { name: 'Bengaluru, Karnataka', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', pincode: '560001', latitude: 12.9716, longitude: 77.5946, type: 'CITY' },
  { name: 'Delhi-NCR', city: 'New Delhi', district: 'New Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6139, longitude: 77.2090, type: 'CITY' },
  { name: 'Mumbai, Maharashtra', city: 'Mumbai', district: 'Mumbai', state: 'Maharashtra', pincode: '400001', latitude: 19.0760, longitude: 72.8777, type: 'CITY' },
  { name: 'Patna, Bihar', city: 'Patna', district: 'Patna', state: 'Bihar', pincode: '800001', latitude: 25.5941, longitude: 85.1376, type: 'CITY' },
  { name: 'Pune, Maharashtra', city: 'Pune', district: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.5204, longitude: 73.8567, type: 'CITY' },
  { name: 'Hyderabad, Telangana', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', pincode: '500001', latitude: 17.3850, longitude: 78.4867, type: 'CITY' },
  { name: 'Varanasi, Uttar Pradesh', city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001', latitude: 25.3176, longitude: 82.9739, type: 'CITY' },
  { name: 'Kolkata, West Bengal', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', pincode: '700001', latitude: 22.5726, longitude: 88.3639, type: 'CITY' },
];

export function searchIndianLocations(query: string, limit: number = 10): IndianLocation[] {
  if (!query || query.trim().length === 0) return POPULAR_HUBS.slice(0, limit);
  const q = query.trim().toLowerCase();

  // Search by pincode prefix or exact
  const pincodeMatches = INDIAN_LOCATIONS.filter((loc) => loc.pincode && loc.pincode.startsWith(q));

  // Search by text fields
  const textMatches = INDIAN_LOCATIONS.filter((loc) => {
    const nameMatch = loc.name.toLowerCase().includes(q);
    const cityMatch = loc.city.toLowerCase().includes(q);
    const districtMatch = loc.district.toLowerCase().includes(q);
    const localityMatch = loc.locality ? loc.locality.toLowerCase().includes(q) : false;
    const stateMatch = loc.state.toLowerCase().includes(q);
    return nameMatch || cityMatch || districtMatch || localityMatch || stateMatch;
  });

  const seen = new Set<string>();
  const combined: IndianLocation[] = [];

  for (const loc of [...pincodeMatches, ...textMatches]) {
    const key = `${loc.city}-${loc.locality || ''}-${loc.pincode || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(loc);
    }
  }

  // Prioritize startsWith matches
  combined.sort((a, b) => {
    const aPincode = a.pincode?.startsWith(q) ? 1 : 0;
    const bPincode = b.pincode?.startsWith(q) ? 1 : 0;
    if (aPincode !== bPincode) return bPincode - aPincode;

    const aStarts =
      a.name.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().startsWith(q) ||
      (a.locality ? a.locality.toLowerCase().startsWith(q) : false);
    const bStarts =
      b.name.toLowerCase().startsWith(q) ||
      b.city.toLowerCase().startsWith(q) ||
      (b.locality ? b.locality.toLowerCase().startsWith(q) : false);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  });

  return combined.slice(0, limit);
}

export function findNearestLocation(lat: number, lng: number): IndianLocation {
  let nearest = INDIAN_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of INDIAN_LOCATIONS) {
    const dLat = ((loc.latitude - lat) * Math.PI) / 180;
    const dLon = ((loc.longitude - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((loc.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c;
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc;
    }
  }

  return nearest;
}

