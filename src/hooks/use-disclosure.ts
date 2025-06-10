import { useState, useCallback } from "react";

interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  isControlled: boolean;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
}

export function useDisclosure(defaultIsOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const getButtonProps = useCallback((props: any = {}) => {
    return {
      ...props,
      "aria-expanded": isOpen,
      onClick: callAll(props.onClick, onToggle)
    };
  }, [isOpen, onToggle]);

  const getDisclosureProps = useCallback((props: any = {}) => {
    return {
      ...props,
      hidden: !isOpen
    };
  }, [isOpen]);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    isControlled: false,
    getButtonProps,
    getDisclosureProps
  };
}

function callAll(...fns: any[]) {
  return (...args: any[]) => {
    fns.forEach(fn => fn?.(...args));
  };
}