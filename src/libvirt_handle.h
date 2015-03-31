#ifndef LIBVIRT_HANDLE_H
#define LIBVIRT_HANDLE_H

#include <libvirt/libvirt.h>
#include <memory>
using namespace std;

namespace NodeLibvirt {

class LibVirtHandlePrivate;
class LibVirtHandle
{
public:
  LibVirtHandle();
  LibVirtHandle(virConnectPtr connection);
  LibVirtHandle(virInterfacePtr interface);
  LibVirtHandle(virNetworkPtr network);
  LibVirtHandle(virNWFilterPtr networkFilter);

  void Clear();

  virConnectPtr ToConnection() const;
  virInterfacePtr ToInterface() const;
  virNetworkPtr ToNetwork() const;
  virNWFilterPtr ToNetworkFilter() const;

private:
  shared_ptr<LibVirtHandlePrivate> d;

};

} // namespace NodeLibvirt

#endif  // LIBVIRT_HANDLE_H
