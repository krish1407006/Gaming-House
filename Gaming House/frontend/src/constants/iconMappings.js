// Icon mapping constants for replacing emojis with React Icons
import {
  // Profile & User Icons
  FiUser,
  FiSettings,
  FiEdit3,
  
  // Statistics & Analytics
  FiBarChart2,
  FiTrendingUp,
  FiPieChart,
  
  // Display & Theme
  FiDroplet,
  FiMoon,
  FiSun,
  FiEye,
  
  // Privacy & Security
  FiLock,
  FiShield,
  FiEyeOff,
  
  // Data Management
  FiSave,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiRotateCcw,
  
  // Actions & Status
  FiCheck,
  FiX,
  FiCheckCircle,
  FiXCircle,
  
  // Movies & Entertainment
  FiFilm,
  FiPlay,
  FiStar,
  FiHeart,
  FiBookmark,
  
  // Navigation & Search
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  
  // General Purpose
  FiHome,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiShare2,
} from 'react-icons/fi';

import {
  // Genre specific icons
  MdLocalMovies, // Action (movie icon)
  MdExplore, // Adventure
  MdAnimation, // Animation
  MdSentimentVerySatisfied, // Comedy
  MdGavel, // Crime
  MdVideocam, // Documentary
  MdTheaterComedy, // Drama
  MdFamilyRestroom, // Family
  MdAutoFixHigh, // Fantasy
  MdHistoryEdu, // History
  MdWarning, // Horror/Thriller
  MdMusicNote, // Music
  MdSearch, // Mystery
  MdFavorite, // Romance
  MdRocket, // Science Fiction
  MdSecurity, // War
  MdLandscape, // Western
  MdMovie, // General movie icon
} from 'react-icons/md';

// Icon configuration object
export const AppIcons = {
  // Profile & User
  profile: FiUser,
  settings: FiSettings,
  edit: FiEdit3,
  
  // Statistics
  stats: FiBarChart2,
  trending: FiTrendingUp,
  chart: FiPieChart,
  
  // Display & Theme
  palette: FiDroplet,
  moon: FiMoon,
  sun: FiSun,
  eye: FiEye,
  eyeOff: FiEyeOff,
  
  // Privacy & Security
  lock: FiLock,
  shield: FiShield,
  
  // Data Management
  save: FiSave,
  trash: FiTrash2,
  download: FiDownload,
  upload: FiUpload,
  refresh: FiRefreshCw,
  reset: FiRotateCcw,
  
  // Actions & Status
  check: FiCheck,
  x: FiX,
  checkCircle: FiCheckCircle,
  xCircle: FiXCircle,
  
  // Movies & Entertainment
  film: FiFilm,
  play: FiPlay,
  star: FiStar,
  heart: FiHeart,
  bookmark: FiBookmark,
  
  // Navigation & Search
  search: FiSearch,
  filter: FiFilter,
  grid: FiGrid,
  list: FiList,
  
  // General
  home: FiHome,
  plus: FiPlus,
  minus: FiMinus,
  arrowRight: FiArrowRight,
  arrowLeft: FiArrowLeft,
  chevronDown: FiChevronDown,
  chevronUp: FiChevronUp,
  externalLink: FiExternalLink,
  share: FiShare2,
  image: FiFilm, // Adding missing image icon (using film as fallback)
};

// Genre Icons
export const GenreIcons = {
  Action: MdLocalMovies,
  Adventure: MdExplore,
  Animation: MdAnimation,
  Comedy: MdSentimentVerySatisfied,
  Crime: MdGavel,
  Documentary: MdVideocam,
  Drama: MdTheaterComedy,
  Family: MdFamilyRestroom,
  Fantasy: MdAutoFixHigh,
  History: MdHistoryEdu,
  Horror: MdWarning,
  Music: MdMusicNote,
  Mystery: MdSearch,
  Romance: MdFavorite,
  "Science Fiction": MdRocket,
  Thriller: MdWarning,
  War: MdSecurity,
  Western: MdLandscape,
};