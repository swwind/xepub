declare module '*.lazy.less' {
  const less: {
    use: () => void;
    unuse: () => void;
  };
  export default less;
}