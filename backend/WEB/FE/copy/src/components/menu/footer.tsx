/**
 * 푸터 컴포넌트
 */

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              © 2024 CDD. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              이용약관
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              고객지원
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 