require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = package["name"]
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platform     = :ios, "8.0"
  s.requires_arc = true
  s.source = {
    :git => "https://github.com/EdgeApp/edge-login-ui-rn.git",
    :tag => "v#{s.version}"
  }
  s.source_files = "ios/**/*.{h,m}"

  s.dependency "React-Core"
end
